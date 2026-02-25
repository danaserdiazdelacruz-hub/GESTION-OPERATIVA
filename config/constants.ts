// ============================================================================
//  CENTINELA — Constants & Configuration
// ============================================================================

import { UserRole, Permission } from '@/types';

export const AUTH_CONFIG = {
  SESSION_DURATION: 8 * 60 * 60 * 1000,
  RENEW_THRESHOLD: 30 * 60 * 1000,
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000,
  MAX_USERS: 10,
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: [
    Permission.USERS_CREATE,
    Permission.USERS_READ,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
    Permission.EVALUATIONS_CREATE,
    Permission.EVALUATIONS_READ,
    Permission.EVALUATIONS_DELETE,
    Permission.ACTIONS_MANAGE,
    Permission.ANALYSIS_READ,
    Permission.CONFIG_READ,
    Permission.CONFIG_UPDATE,
    Permission.CONFIG_ADVANCED,
  ],
  [UserRole.SUPERVISOR]: [
    Permission.USERS_READ,
    Permission.EVALUATIONS_READ,
    Permission.ACTIONS_MANAGE,
    Permission.ANALYSIS_READ,
  ],
  [UserRole.OPERATOR]: [
    Permission.EVALUATIONS_CREATE,
    Permission.EVALUATIONS_READ,
    Permission.ACTIONS_MANAGE,
  ],
  [UserRole.VIEWER]: [
    Permission.EVALUATIONS_READ,
    Permission.ANALYSIS_READ,
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.SUPERVISOR]: 'Supervisor',
  [UserRole.OPERATOR]: 'Operador',
  [UserRole.VIEWER]: 'Visualizador',
};

export const TAB_PERMISSIONS: Record<string, Permission | null> = {
  inicio: null,
  historial: Permission.EVALUATIONS_READ,
  action_plan: Permission.ACTIONS_MANAGE,
  analysis: Permission.ANALYSIS_READ,
  checklist: Permission.EVALUATIONS_CREATE,
  config: Permission.CONFIG_READ,
};
