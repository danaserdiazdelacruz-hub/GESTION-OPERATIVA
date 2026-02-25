// ============================================================================
//  CENTINELA — Database Service (Dexie / IndexedDB)
// ============================================================================

import Dexie, { type Table } from 'dexie';
import type {
  User,
  SafeUser,
  Session,
  CompletedEvaluation,
  CorrectiveAction,
  ActionHistory,
  ActionStatusKey,
  Attachment,
  ChecklistSection,
} from '@/types';
import { hashPassword, verifyPassword } from './crypto.utils';

// ---------------------------------------------------------------------------
//  Database Schema Definition
// ---------------------------------------------------------------------------

class CentinelaDB extends Dexie {
  evaluations!: Table<CompletedEvaluation, string>;
  checklistConfig!: Table<ChecklistSection, string>;
  correctiveActions!: Table<CorrectiveAction, string>;
  actionHistory!: Table<ActionHistory, number>;
  attachments!: Table<Attachment, string>;
  users!: Table<User, string>;
  sessions!: Table<Session, string>;

  constructor() {
    super('SecurityScannerDB_v4.0.8_Centinela_HTTPS');

    this.version(18).stores({
      evaluations: 'id, createdAt',
      checklistConfig: 'id',
      correctiveActions: 'id, evaluationId, status, dueDate, sectionId',
      actionHistory: '++uid, actionId',
      attachments: 'id, parentId',
      users: 'id, &username, role, isActive',
      sessions: 'id, &token, userId, isActive, expiresAt',
    });
  }
}

export const db = new CentinelaDB();

// ---------------------------------------------------------------------------
//  Helper: Strip passwordHash from User
// ---------------------------------------------------------------------------

function toSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

// ---------------------------------------------------------------------------
//  Users
// ---------------------------------------------------------------------------

export async function createUser(data: {
  username: string;
  password: string;
  displayName: string;
  role: string;
  isActive: boolean;
}): Promise<void> {
  const existing = await db.users
    .where('username')
    .equalsIgnoreCase(data.username.trim())
    .first();

  if (existing) {
    throw new Error(`El nombre de usuario "${data.username}" ya está en uso.`);
  }

  const user: User = {
    id: `user_${Date.now()}_${Math.random()}`,
    username: data.username.trim(),
    passwordHash: await hashPassword(data.password),
    displayName: data.displayName,
    role: data.role as User['role'],
    isActive: data.isActive,
  };

  await db.users.add(user);
}

export async function validateUser(
  username: string,
  password: string
): Promise<SafeUser | null> {
  const user = await db.users
    .where('username')
    .equalsIgnoreCase(username)
    .first();

  if (user && user.isActive && (await verifyPassword(password, user.passwordHash))) {
    return toSafeUser(user);
  }
  return null;
}

export async function getAllUsers(): Promise<SafeUser[]> {
  const users = await db.users.toArray();
  return users.map(toSafeUser);
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const user = await db.users.get(id);
  return user ? toSafeUser(user) : null;
}

export async function updateUser(
  id: string,
  data: { displayName: string; password?: string; role: string; isActive: boolean }
): Promise<void> {
  const updates: Partial<User> = {
    displayName: data.displayName,
    role: data.role as User['role'],
    isActive: data.isActive,
  };
  if (data.password) {
    updates.passwordHash = await hashPassword(data.password);
  }
  await db.users.update(id, updates);
}

export async function deleteUser(id: string): Promise<void> {
  await db.users.delete(id);
}

export async function updateUserLastLogin(id: string): Promise<void> {
  await db.users.update(id, { lastLogin: new Date().toISOString() });
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await db.users.get(userId);
  if (!user) throw new Error('Usuario no encontrado.');

  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) throw new Error('La contraseña actual es incorrecta.');

  const newHash = await hashPassword(newPassword);
  await db.users.update(userId, { passwordHash: newHash });
}

// ---------------------------------------------------------------------------
//  Sessions
// ---------------------------------------------------------------------------

export async function createSession(session: Session): Promise<void> {
  await db.sessions.add(session);
}

export async function getSession(token: string): Promise<Session | undefined> {
  return db.sessions.get(token);
}

export async function deactivateSession(token: string): Promise<void> {
  await db.sessions.update(token, { isActive: false });
}

// ---------------------------------------------------------------------------
//  Admin Bootstrap
// ---------------------------------------------------------------------------

export async function ensureAdminUser(): Promise<void> {
  const adminId = 'admin_user_main';
  const adminUser = await db.users.get(adminId);

  if (!adminUser) {
    const existingAdmin = await db.users
      .where('username')
      .equalsIgnoreCase('admin')
      .first();

    if (existingAdmin && existingAdmin.id !== adminId) {
      await db.users.delete(existingAdmin.id);
    }

    await db.users.put({
      id: adminId,
      username: 'admin',
      passwordHash: await hashPassword('admin'),
      displayName: 'Administrador',
      role: 'SUPER_ADMIN' as User['role'],
      isActive: true,
    });
  }
}

// ---------------------------------------------------------------------------
//  Evaluations
// ---------------------------------------------------------------------------

export async function saveEvaluation(evaluation: CompletedEvaluation): Promise<void> {
  await db.evaluations.put(JSON.parse(JSON.stringify(evaluation)));
}

export async function getAllEvaluations(): Promise<CompletedEvaluation[]> {
  return db.evaluations.orderBy('createdAt').toArray();
}

export async function getEvaluationById(id: string): Promise<CompletedEvaluation | undefined> {
  return db.evaluations.get(id);
}

export async function getLastEvaluation(): Promise<CompletedEvaluation | undefined> {
  return db.evaluations.orderBy('createdAt').last();
}

export async function hasEvaluations(): Promise<boolean> {
  return (await db.evaluations.count()) > 0;
}

export async function deleteEvaluations(evaluationIds: string[]): Promise<void> {
  if (!evaluationIds.length) return;

  await db.transaction(
    'rw',
    db.evaluations,
    db.correctiveActions,
    db.actionHistory,
    db.attachments,
    async () => {
      const actionsToDelete = await db.correctiveActions
        .where('evaluationId')
        .anyOf(evaluationIds)
        .toArray();

      const actionIds = actionsToDelete.map((a) => a.id);

      if (actionIds.length > 0) {
        await db.actionHistory.where('actionId').anyOf(actionIds).delete();
        await db.attachments.where('parentId').anyOf(actionIds).delete();
      }

      await db.correctiveActions.where('evaluationId').anyOf(evaluationIds).delete();

      for (const evalId of evaluationIds) {
        await db.attachments.where('parentId').startsWith(evalId).delete();
      }

      await db.evaluations.bulkDelete(evaluationIds);
    }
  );
}

// ---------------------------------------------------------------------------
//  Corrective Actions
// ---------------------------------------------------------------------------

export async function saveActionWithHistory(
  action: CorrectiveAction,
  changedBy: string,
  comment = 'Acción creada.'
): Promise<void> {
  await db.correctiveActions.put(action);
  await db.actionHistory.add({
    actionId: action.id,
    status: action.status,
    comment,
    changedBy,
    timestamp: new Date().toISOString(),
  });
}

export async function updateActionStatus(
  actionId: string,
  newStatus: ActionStatusKey,
  changedBy: string,
  comment = ''
): Promise<void> {
  await db.correctiveActions.update(actionId, {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
  await db.actionHistory.add({
    actionId,
    status: newStatus,
    comment,
    changedBy,
    timestamp: new Date().toISOString(),
  });
}

export async function getAllCorrectiveActions(): Promise<CorrectiveAction[]> {
  return db.correctiveActions.toArray();
}

export async function getActionById(id: string): Promise<CorrectiveAction | undefined> {
  return db.correctiveActions.get(id);
}

export async function getActionHistory(actionId: string): Promise<ActionHistory[]> {
  return db.actionHistory.where('actionId').equals(actionId).toArray();
}

export async function deleteAction(actionId: string): Promise<void> {
  await db.transaction('rw', db.correctiveActions, db.actionHistory, db.attachments, async () => {
    await db.correctiveActions.delete(actionId);
    await db.actionHistory.where('actionId').equals(actionId).delete();
    await db.attachments.where('parentId').equals(actionId).delete();
  });
}

export async function getOpenActionsCount(): Promise<number> {
  return db.correctiveActions
    .where('status')
    .noneOf(['completed', 'cancelled'])
    .count();
}

// ---------------------------------------------------------------------------
//  Checklist Config
// ---------------------------------------------------------------------------

export async function getChecklistConfig(): Promise<ChecklistSection[]> {
  return db.checklistConfig.toArray();
}

export async function saveChecklistConfig(config: ChecklistSection[]): Promise<void> {
  await db.checklistConfig.clear();
  await db.checklistConfig.bulkPut(config);
}

// ---------------------------------------------------------------------------
//  Attachments
// ---------------------------------------------------------------------------

export async function saveAttachment(attachment: Attachment): Promise<void> {
  await db.attachments.put(attachment);
}

export async function getAttachmentById(id: string): Promise<Attachment | undefined> {
  return db.attachments.get(id);
}

export async function getAttachmentsForParent(parentId: string): Promise<Attachment[]> {
  return db.attachments.where('parentId').equals(parentId).toArray();
}

export async function deleteAttachment(id: string): Promise<void> {
  await db.attachments.delete(id);
}

export async function downloadAttachment(id: string): Promise<void> {
  const attachment = await getAttachmentById(id);
  if (!attachment) {
    throw new Error('No se pudo encontrar el archivo.');
  }
  const url = URL.createObjectURL(attachment.fileData as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = attachment.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
//  Purge (Danger Zone)
// ---------------------------------------------------------------------------

export async function purgeAllData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      if (!['users', 'checklistConfig', 'sessions'].includes(table.name)) {
        await table.clear();
      }
    }
  });
}
