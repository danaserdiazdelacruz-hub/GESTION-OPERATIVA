// ============================================================================
//  CENTINELA — Auth Types
// ============================================================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
}

export enum Permission {
  USERS_CREATE = 'users:create',
  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  EVALUATIONS_CREATE = 'evaluations:create',
  EVALUATIONS_READ = 'evaluations:read',
  EVALUATIONS_DELETE = 'evaluations:delete',
  ACTIONS_MANAGE = 'actions:manage',
  ACTIONS_DELETE = 'actions:delete',
  ANALYSIS_READ = 'analysis:read',
  CONFIG_READ = 'config:read',
  CONFIG_UPDATE = 'config:update',
  CONFIG_ADVANCED = 'config:advanced',
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
}

/** User sin el hash de contraseña — seguro para usar en el frontend */
export type SafeUser = Omit<User, 'passwordHash'>;

export interface Session {
  id: string;
  token: string;
  userId: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginAttempt {
  count: number;
  lastAttempt: number;
}

export interface AuthState {
  currentUser: SafeUser | null;
  currentSession: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CreateUserData {
  username: string;
  password: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
}

export interface UpdateUserData {
  displayName: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
}
