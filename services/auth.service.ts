// ============================================================================
//  CENTINELA — Auth Service
// ============================================================================

import type { SafeUser, Session } from '@/types';
import { AUTH_CONFIG } from '@/config/constants';
import { generateToken } from './crypto.utils';
import * as dbService from './database.service';

const STORAGE_KEY = 'centinela_session';

interface StoredSession {
  token: string;
  userId: string;
  expiresAt: string;
}

export async function login(
  username: string,
  password: string
): Promise<SafeUser> {
  const user = await dbService.validateUser(username, password);
  if (!user) {
    throw new Error('Usuario o contraseña incorrectos.');
  }

  const sessionToken = generateToken();
  const expiresAt = new Date(Date.now() + AUTH_CONFIG.SESSION_DURATION).toISOString();

  const session: Session = {
    id: sessionToken,
    userId: user.id,
    token: sessionToken,
    expiresAt,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  await dbService.createSession(session);
  await dbService.updateUserLastLogin(user.id);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ token: sessionToken, userId: user.id, expiresAt })
  );

  return user;
}

export async function restoreSession(): Promise<SafeUser | null> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const { token } = JSON.parse(stored) as StoredSession;
    const session = await dbService.getSession(token);

    if (!session || !session.isActive || new Date() >= new Date(session.expiresAt)) {
      if (session) await dbService.deactivateSession(token);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const user = await dbService.getUserById(session.userId);
    return user;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export async function logout(): Promise<void> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const { token } = JSON.parse(stored) as StoredSession;
      await dbService.deactivateSession(token);
    } catch {
      // Si falla la desactivación, igual limpiamos el storage local
    }
  }
  localStorage.removeItem(STORAGE_KEY);
}
