// ============================================================================
//  CENTINELA — Evaluation Types
// ============================================================================

export interface ChecklistFeedback {
  critical: string;
  warning: string;
  optimal: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  icon: string;
  questions: string[];
  feedback: ChecklistFeedback;
}

export interface SectionScore {
  score: number;
  total: number;
}

export interface ThreeWhys {
  why1: string;
  why2: string;
  why3: string;
}

/** Respuesta por pregunta: 1 = Sí, 0 = No, null = sin responder */
export type QuestionAnswer = 1 | 0 | null;

export interface AttachmentReference {
  id: string;
  fileName: string;
}

export interface ActiveEvaluation {
  id: string;
  createdAt: string;
  answers: Record<string, QuestionAnswer[]>;
  pendingActions: Record<string, PendingAction>;
  threeWhys: Record<string, ThreeWhys>;
  attachments: Record<string, AttachmentReference[]>;
}

export interface PendingAction {
  id: string;
  evaluationId: string;
  sectionId: string;
  questionIndex: number;
  questionText: string;
  threeWhys: ThreeWhys;
  description: string;
  responsible: string;
  dueDate: string;
  priority: ActionPriority;
  status: string;
  addedToPlan: boolean;
  createdAt: string;
  updatedAt: string;
  evidenceIds: string[];
  tags: string[];
}

export type ActionPriority = 'low' | 'medium' | 'high';

export interface CompletedEvaluation {
  id: string;
  createdAt: string;
  scores: Record<string, SectionScore>;
  compliance: number;
  attachments: Record<string, AttachmentReference[]>;
  answers: Record<string, QuestionAnswer[]>;
  threeWhys: Record<string, ThreeWhys>;
}

export type ScoreStatus = 'critical' | 'warning' | 'optimal';
