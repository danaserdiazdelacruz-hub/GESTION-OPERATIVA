// ============================================================================
//  CENTINELA — Corrective Action Types
// ============================================================================

import type { ActionPriority, ThreeWhys } from './evaluation.types';

export type ActionStatusKey =
  | 'new'
  | 'planned'
  | 'in_progress'
  | 'pending_verification'
  | 'completed'
  | 'cancelled'
  | 'overdue';

export interface CorrectiveAction {
  id: string;
  evaluationId: string | null;
  sectionId: string | null;
  questionIndex: number | null;
  questionText: string;
  threeWhys: ThreeWhys | null;
  description: string;
  responsible: string;
  dueDate: string;
  priority: ActionPriority;
  status: ActionStatusKey;
  addedToPlan: boolean;
  createdAt: string;
  updatedAt: string;
  evidenceIds: string[];
  tags: string[];
}

export interface ActionHistory {
  uid?: number;
  actionId: string;
  status: ActionStatusKey;
  comment: string;
  changedBy: string;
  timestamp: string;
}

export interface ActionFilters {
  status: string;
  responsible: string;
  priority: string;
  searchQuery: string;
}

export interface ActionSort {
  column: string;
  direction: 'asc' | 'desc';
}
