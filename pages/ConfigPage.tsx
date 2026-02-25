// ============================================================================
//  CENTINELA — Config Page (COMPLETA)
// ============================================================================

import { useState, useEffect } from 'react';
import {
  Settings,
  Lock,
  Users,
  Edit3,
  Trash2,
  PlusCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  UserPlus,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { useEvaluation } from '@/context/EvaluationContext';
import { Modal } from '@/components/ui/Modal';
import { ROLE_LABELS } from '@/config/constants';
import { DEFAULT_CHECKLIST_DATA } from '@/config/checklist-default';
import * as dbService from '@/services/database.service';
import { Permission, UserRole } from '@/types';
import type { SafeUser, ChecklistSection } from '@/types';

export function ConfigPage() {
  const { currentUser, hasPermission, logout } = useAuth();
  const { showAlert } = useAlert();
  const { checklistConfig, reloadChecklistConfig } = useEvaluation();
  const [activeTab, setActiveTab] = useState<string>('password');

  if (!currentUser) return null;

  const canManageUsers = hasPermission(Permission.USERS_CREATE);
  const canEditConfig = hasPermission(Permission.CONFIG_UPDATE);
  const canAdvanced = hasPermission(Permission.CONFIG_ADVANCED);

  const tabs = [
    { id: 'password', label: 'Contraseña', icon: <Lock className="h-4 w-4" /> },
    ...(canEditConfig ? [{ id: 'checklist', label: 'Checklist', icon: <Edit3 className="h-4 w-4" /> }] : []),
    ...(canManageUsers ? [{ id: 'users', label: 'Usuarios', icon: <Users className="h-4 w-4" /> }] : []),
    ...(canAdvanced ? [{ id: 'danger', label: 'Peligro', icon: <AlertTriangle className="h-4 w-4" /> }] : []),
  ];

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5" /> Configuración
        </h2>

        {/* Sub-tabs */}
        <nav className="flex gap-1 mb-6 border-b pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : tab.id === 'danger'
                    ? 'text-danger hover:bg-danger-light'
                    : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'password' && <PasswordSection userId={currentUser.id} />}
        {activeTab === 'checklist' && canEditConfig && <ChecklistEditorSection />}
        {activeTab === 'users' && canManageUsers && <UserManagementSection />}
        {activeTab === 'danger' && canAdvanced && <DangerZoneSection />}
      </section>
    </div>
  );
}

// ============================================================================
//  Password Change Section
// ============================================================================

function PasswordSection({ userId }: { userId: string }) {
  const { showAlert } = useAlert();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  async function handleSubmit() {
    if (!currentPwd || !newPwd || !confirmPwd) {
      showAlert('error', 'Completa todos los campos.');
      return;
    }
    if (newPwd.length < 4) {
      showAlert('error', 'La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (newPwd !== confirmPwd) {
      showAlert('error', 'Las contraseñas nuevas no coinciden.');
      return;
    }
    try {
      await dbService.changeUserPassword(userId, currentPwd, newPwd);
      showAlert('success', 'Contraseña actualizada correctamente.');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Error al cambiar contraseña.');
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h3 className="font-bold text-sm flex items-center gap-2"><Lock className="h-4 w-4" /> Cambiar Contraseña</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Contraseña Actual</label>
        <div className="relative">
          <input type={showPwd ? 'text' : 'password'} value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)}
            className="w-full px-3 py-2 pr-10 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light">
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
        <input type={showPwd ? 'text' : 'password'} value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
          className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirmar Nueva Contraseña</label>
        <input type={showPwd ? 'text' : 'password'} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
          className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
      </div>
      <button onClick={handleSubmit} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark">
        Cambiar Contraseña
      </button>
    </div>
  );
}

// ============================================================================
//  Checklist Editor Section
// ============================================================================

function ChecklistEditorSection() {
  const { showAlert } = useAlert();
  const { checklistConfig, reloadChecklistConfig } = useEvaluation();
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [editQuestions, setEditQuestions] = useState<string>('');

  useEffect(() => { setSections(JSON.parse(JSON.stringify(checklistConfig))); }, [checklistConfig]);

  function startEdit(sectionId: string) {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      setEditSection(sectionId);
      setEditQuestions(section.questions.join('\n'));
    }
  }

  async function saveEdit() {
    if (!editSection) return;
    const newQuestions = editQuestions.split('\n').map((q) => q.trim()).filter(Boolean);
    if (newQuestions.length === 0) {
      showAlert('error', 'Debe haber al menos una pregunta.');
      return;
    }
    const updated = sections.map((s) => s.id === editSection ? { ...s, questions: newQuestions } : s);
    await dbService.saveChecklistConfig(updated);
    await reloadChecklistConfig();
    setSections(updated);
    setEditSection(null);
    showAlert('success', 'Checklist actualizado.');
  }

  async function resetToDefault() {
    if (!confirm('¿Restaurar el checklist a los valores por defecto? Se perderán las modificaciones.')) return;
    await dbService.saveChecklistConfig(DEFAULT_CHECKLIST_DATA);
    await reloadChecklistConfig();
    setSections(JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_DATA)));
    showAlert('success', 'Checklist restaurado a valores por defecto.');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2"><Edit3 className="h-4 w-4" /> Editor de Checklist</h3>
        <button onClick={resetToDefault} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">
          Restaurar Defecto
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">{section.title}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-light">{section.questions.length} preguntas</span>
              <button onClick={() => startEdit(section.id)} className="p-1.5 rounded-lg hover:bg-gray-200 text-text-light">
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ul className="space-y-1">
            {section.questions.slice(0, 3).map((q, i) => (
              <li key={i} className="text-xs text-text-secondary truncate">• {q}</li>
            ))}
            {section.questions.length > 3 && (
              <li className="text-xs text-text-light italic">... y {section.questions.length - 3} más</li>
            )}
          </ul>
        </div>
      ))}

      <Modal
        isOpen={!!editSection}
        onClose={() => setEditSection(null)}
        title="Editar Preguntas"
        subtitle={sections.find((s) => s.id === editSection)?.title}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button onClick={() => setEditSection(null)} className="px-4 py-2 bg-gray-100 text-text rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button>
            <button onClick={saveEdit} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark flex items-center gap-2">
              <Save className="h-4 w-4" /> Guardar
            </button>
          </>
        }
      >
        <div>
          <p className="text-xs text-text-light mb-2">Una pregunta por línea:</p>
          <textarea
            value={editQuestions}
            onChange={(e) => setEditQuestions(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/30 focus:border-primary"
            rows={12}
          />
        </div>
      </Modal>
    </div>
  );
}

// ============================================================================
//  User Management Section
// ============================================================================

function UserManagementSection() {
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);

  // Form
  const [formUsername, setFormUsername] = useState('');
  const [formDisplay, setFormDisplay] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>(UserRole.OPERATOR);
  const [formActive, setFormActive] = useState(true);

  async function loadUsers() {
    const data = await dbService.getAllUsers();
    setUsers(data);
  }

  useEffect(() => { loadUsers(); }, []);

  function openCreate() {
    setEditingUser(null);
    setFormUsername('');
    setFormDisplay('');
    setFormPassword('');
    setFormRole(UserRole.OPERATOR);
    setFormActive(true);
    setShowModal(true);
  }

  function openEdit(user: SafeUser) {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormDisplay(user.displayName);
    setFormPassword('');
    setFormRole(user.role);
    setFormActive(user.isActive);
    setShowModal(true);
  }

  async function handleSave() {
    if (!formUsername.trim() || !formDisplay.trim()) {
      showAlert('error', 'Usuario y nombre son obligatorios.');
      return;
    }

    try {
      if (editingUser) {
        await dbService.updateUser(editingUser.id, {
          displayName: formDisplay,
          password: formPassword || undefined,
          role: formRole,
          isActive: formActive,
        });
        showAlert('success', 'Usuario actualizado.');
      } else {
        if (!formPassword) {
          showAlert('error', 'La contraseña es obligatoria para nuevos usuarios.');
          return;
        }
        await dbService.createUser({
          username: formUsername.trim(),
          password: formPassword,
          displayName: formDisplay,
          role: formRole,
          isActive: formActive,
        });
        showAlert('success', 'Usuario creado.');
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Error al guardar.');
    }
  }

  async function handleDelete(userId: string) {
    if (userId === currentUser?.id) {
      showAlert('error', 'No puedes eliminarte a ti mismo.');
      return;
    }
    if (!confirm('¿Eliminar este usuario permanentemente?')) return;
    await dbService.deleteUser(userId);
    showAlert('success', 'Usuario eliminado.');
    loadUsers();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Gestión de Usuarios ({users.length})</h3>
        <button onClick={openCreate} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark">
          <UserPlus className="h-3.5 w-3.5" /> Nuevo
        </button>
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xs">
                {user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div className="font-medium text-sm">{user.displayName}</div>
                <div className="text-xs text-text-light flex items-center gap-2">
                  @{user.username} · {ROLE_LABELS[user.role]}
                  {!user.isActive && <span className="text-danger font-bold">INACTIVO</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-gray-200 text-text-light">
                <Edit3 className="h-4 w-4" />
              </button>
              {user.id !== currentUser?.id && (
                <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg hover:bg-danger-light text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-text rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark">
              {editingUser ? 'Actualizar' : 'Crear'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de Usuario</label>
            <input type="text" value={formUsername} onChange={(e) => setFormUsername(e.target.value)}
              disabled={!!editingUser}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-100 disabled:text-text-light" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre Completo</label>
            <input type="text" value={formDisplay} onChange={(e) => setFormDisplay(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{editingUser ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}</label>
            <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select value={formRole} onChange={(e) => setFormRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary">
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-sm font-medium">Usuario activo</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================================
//  Danger Zone Section
// ============================================================================

function DangerZoneSection() {
  const { showAlert } = useAlert();
  const [confirmText, setConfirmText] = useState('');

  async function handlePurge() {
    if (confirmText !== 'ELIMINAR') {
      showAlert('error', 'Escribe ELIMINAR para confirmar.');
      return;
    }
    await dbService.purgeAllData();
    showAlert('success', 'Todos los datos han sido eliminados.');
    setConfirmText('');
  }

  return (
    <div className="max-w-md space-y-4">
      <h3 className="font-bold text-sm flex items-center gap-2 text-danger">
        <AlertTriangle className="h-4 w-4" /> Zona de Peligro
      </h3>
      <div className="bg-danger-light border border-danger/20 rounded-xl p-5">
        <h4 className="font-bold text-danger-dark mb-2">Eliminar Todos los Datos</h4>
        <p className="text-sm text-text-secondary mb-4">
          Esta acción eliminará permanentemente todas las evaluaciones, acciones correctivas y adjuntos.
          Los usuarios y la configuración del checklist se mantienen.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Escribe "ELIMINAR" para confirmar'
            className="flex-1 px-3 py-2 border border-danger/30 rounded-xl text-sm focus:ring-2 focus:ring-danger/30 focus:border-danger"
          />
          <button
            onClick={handlePurge}
            disabled={confirmText !== 'ELIMINAR'}
            className="px-4 py-2 bg-danger text-white rounded-xl text-sm font-semibold hover:bg-danger-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Eliminar Todo
          </button>
        </div>
      </div>
    </div>
  );
}
