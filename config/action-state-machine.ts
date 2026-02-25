// ============================================================================
//  CENTINELA — Action Status State Machine
// ============================================================================

import type { ActionStatusKey } from '@/types';

export const ACTION_STATUSES: Record<ActionStatusKey, string> = {
  new: 'Nueva',
  planned: 'Planificada',
  in_progress: 'En Progreso',
  pending_verification: 'Verificación',
  completed: 'Completada',
  cancelled: 'Cancelada',
  overdue: 'Vencida',
};

const transitions: Record<string, ActionStatusKey[]> = {
  new: ['planned', 'cancelled'],
  planned: ['in_progress', 'cancelled'],
  in_progress: ['pending_verification', 'completed', 'cancelled'],
  pending_verification: ['completed', 'in_progress'],
  completed: ['in_progress'],
  cancelled: ['new'],
};

export function getValidNextStates(currentStatus: ActionStatusKey): ActionStatusKey[] {
  return transitions[currentStatus] || [];
}
