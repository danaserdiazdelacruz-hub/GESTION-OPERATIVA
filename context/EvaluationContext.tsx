// ============================================================================
//  CENTINELA — Evaluation Context
// ============================================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  ActiveEvaluation,
  ChecklistSection,
  QuestionAnswer,
  ThreeWhys,
  PendingAction,
  AttachmentReference,
  CompletedEvaluation,
} from '@/types';
import { DEFAULT_CHECKLIST_DATA } from '@/config/checklist-default';
import * as dbService from '@/services/database.service';
import { useAuth } from './AuthContext';
import { useAlert } from './AlertContext';

interface EvaluationContextValue {
  activeEvaluation: ActiveEvaluation | null;
  checklistConfig: ChecklistSection[];
  startNewEvaluation: () => boolean;
  cancelEvaluation: () => void;
  setAnswer: (sectionId: string, questionIndex: number, value: QuestionAnswer) => void;
  setThreeWhys: (questionId: string, data: ThreeWhys) => void;
  setPendingAction: (questionId: string, action: PendingAction) => void;
  removePendingAction: (questionId: string) => void;
  addAttachment: (questionId: string, ref: AttachmentReference) => void;
  removeAttachment: (questionId: string, attachmentId: string) => void;
  finishEvaluation: () => Promise<boolean>;
  isEvaluationComplete: () => boolean;
  reloadChecklistConfig: () => Promise<void>;
}

const EvaluationContext = createContext<EvaluationContextValue | null>(null);

export function EvaluationProvider({ children }: { children: ReactNode }) {
  const [activeEvaluation, setActiveEvaluation] = useState<ActiveEvaluation | null>(null);
  const [checklistConfig, setChecklistConfig] = useState<ChecklistSection[]>([]);
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();

  // Cargar configuración del checklist al inicio
  useEffect(() => {
    async function loadConfig() {
      const config = await dbService.getChecklistConfig();
      if (config.length === 0) {
        await dbService.saveChecklistConfig(DEFAULT_CHECKLIST_DATA);
        setChecklistConfig(DEFAULT_CHECKLIST_DATA);
      } else {
        setChecklistConfig(config);
      }
    }
    loadConfig();
  }, []);

  const reloadChecklistConfig = useCallback(async () => {
    const config = await dbService.getChecklistConfig();
    setChecklistConfig(config.length > 0 ? config : DEFAULT_CHECKLIST_DATA);
  }, []);

  const startNewEvaluation = useCallback((): boolean => {
    if (activeEvaluation) {
      const confirmed = window.confirm('Tienes una evaluación en curso. ¿Descartarla?');
      if (!confirmed) return false;
    }
    setActiveEvaluation({
      id: `eval_${Date.now()}`,
      createdAt: new Date().toISOString(),
      answers: {},
      pendingActions: {},
      threeWhys: {},
      attachments: {},
    });
    return true;
  }, [activeEvaluation]);

  const cancelEvaluation = useCallback(() => {
    setActiveEvaluation(null);
  }, []);

  const setAnswer = useCallback(
    (sectionId: string, questionIndex: number, value: QuestionAnswer) => {
      setActiveEvaluation((prev) => {
        if (!prev) return prev;
        const sectionAnswers = [...(prev.answers[sectionId] || [])];

        // Asegurar que el array tiene el tamaño correcto
        const section = checklistConfig.find((s) => s.id === sectionId);
        if (section) {
          while (sectionAnswers.length < section.questions.length) {
            sectionAnswers.push(null);
          }
        }

        sectionAnswers[questionIndex] = value;

        return {
          ...prev,
          answers: { ...prev.answers, [sectionId]: sectionAnswers },
        };
      });
    },
    [checklistConfig]
  );

  const setThreeWhys = useCallback((questionId: string, data: ThreeWhys) => {
    setActiveEvaluation((prev) => {
      if (!prev) return prev;
      return { ...prev, threeWhys: { ...prev.threeWhys, [questionId]: data } };
    });
  }, []);

  const setPendingAction = useCallback((questionId: string, action: PendingAction) => {
    setActiveEvaluation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pendingActions: { ...prev.pendingActions, [questionId]: action },
      };
    });
  }, []);

  const removePendingAction = useCallback((questionId: string) => {
    setActiveEvaluation((prev) => {
      if (!prev) return prev;
      const { [questionId]: _, ...rest } = prev.pendingActions;
      const { [questionId]: __, ...restWhys } = prev.threeWhys;
      return { ...prev, pendingActions: rest, threeWhys: restWhys };
    });
  }, []);

  const addAttachment = useCallback((questionId: string, ref: AttachmentReference) => {
    setActiveEvaluation((prev) => {
      if (!prev) return prev;
      const existing = prev.attachments[questionId] || [];
      return {
        ...prev,
        attachments: { ...prev.attachments, [questionId]: [...existing, ref] },
      };
    });
  }, []);

  const removeAttachment = useCallback((questionId: string, attachmentId: string) => {
    setActiveEvaluation((prev) => {
      if (!prev) return prev;
      const existing = prev.attachments[questionId] || [];
      return {
        ...prev,
        attachments: {
          ...prev.attachments,
          [questionId]: existing.filter((a) => a.id !== attachmentId),
        },
      };
    });
  }, []);

  const isEvaluationComplete = useCallback((): boolean => {
    if (!activeEvaluation) return false;
    return checklistConfig.some((section) => {
      const answers = activeEvaluation.answers[section.id];
      if (!answers || answers.length !== section.questions.length) return false;
      return answers.every((a) => a !== null);
    });
  }, [activeEvaluation, checklistConfig]);

  const finishEvaluation = useCallback(async (): Promise<boolean> => {
    if (!activeEvaluation || !currentUser) return false;

    let totalAnswered = 0;
    let totalCorrect = 0;
    const scores: CompletedEvaluation['scores'] = {};

    checklistConfig.forEach((section) => {
      const sectionAnswers = activeEvaluation.answers[section.id] || [];
      const isComplete =
        sectionAnswers.length === section.questions.length &&
        sectionAnswers.every((a) => a !== null);

      if (isComplete) {
        const correct = sectionAnswers.filter((a) => a === 1).length;
        scores[section.id] = { score: correct, total: section.questions.length };
        totalAnswered += section.questions.length;
        totalCorrect += correct;
      }
    });

    if (Object.keys(scores).length === 0) {
      showAlert('warning', 'No se guardó la evaluación porque no se completó ningún módulo.');
      return false;
    }

    const compliance = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

    const completed: CompletedEvaluation = {
      id: activeEvaluation.id,
      createdAt: activeEvaluation.createdAt,
      scores,
      compliance,
      attachments: activeEvaluation.attachments,
      answers: activeEvaluation.answers,
      threeWhys: activeEvaluation.threeWhys,
    };

    await dbService.saveEvaluation(completed);

    const actionsToSave = Object.values(activeEvaluation.pendingActions);
    for (const action of actionsToSave) {
      await dbService.saveActionWithHistory(
        { ...action, status: 'new' as const },
        currentUser.username
      );
    }

    setActiveEvaluation(null);
    showAlert('success', 'Evaluación guardada correctamente.');
    return true;
  }, [activeEvaluation, checklistConfig, currentUser, showAlert]);

  return (
    <EvaluationContext.Provider
      value={{
        activeEvaluation,
        checklistConfig,
        startNewEvaluation,
        cancelEvaluation,
        setAnswer,
        setThreeWhys,
        setPendingAction,
        removePendingAction,
        addAttachment,
        removeAttachment,
        finishEvaluation,
        isEvaluationComplete,
        reloadChecklistConfig,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation(): EvaluationContextValue {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error('useEvaluation debe usarse dentro de <EvaluationProvider>');
  }
  return context;
}
