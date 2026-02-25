// ============================================================================
//  CENTINELA — Checklist Page (COMPLETA)
// ============================================================================

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  X,
  Paperclip,
  PenSquare,
  Trash2,
  Download,
  Shield,
  Users,
  Package,
  Camera,
  Siren,
} from 'lucide-react';
import { useEvaluation } from '@/context/EvaluationContext';
import { useAlert } from '@/context/AlertContext';
import { Modal } from '@/components/ui/Modal';
import * as dbService from '@/services/database.service';
import type { ThreeWhys, ActionPriority, AttachmentReference } from '@/types';
import type { TabId } from '@/components/layout/TabNavigation';

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Shield: <Shield className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  Camera: <Camera className="h-4 w-4" />,
  Siren: <Siren className="h-4 w-4" />,
};

const SECTION_COLORS: Record<string, string> = {
  disciplina: 'bg-blue-500',
  entorno: 'bg-emerald-500',
  operacion: 'bg-violet-500',
  vigilancia: 'bg-orange-500',
  respuesta: 'bg-red-500',
};

interface ChecklistPageProps {
  onNavigate: (tab: TabId) => void;
}

export function ChecklistPage({ onNavigate }: ChecklistPageProps) {
  const {
    activeEvaluation,
    checklistConfig,
    setAnswer,
    setThreeWhys,
    setPendingAction,
    removePendingAction,
    addAttachment,
    removeAttachment,
    finishEvaluation,
    isEvaluationComplete,
  } = useEvaluation();
  const { showAlert } = useAlert();

  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [whysModal, setWhysModal] = useState<{ sectionId: string; qIndex: number } | null>(null);
  const [actionModal, setActionModal] = useState<{
    sectionId: string;
    qIndex: number;
    whys: ThreeWhys;
  } | null>(null);
  const [attachModal, setAttachModal] = useState<{ sectionId: string; qIndex: number } | null>(
    null
  );

  // Form states for modals
  const [why1, setWhy1] = useState<string>('');
  const [why2, setWhy2] = useState<string>('');
  const [why3, setWhy3] = useState<string>('');
  const [actionDesc, setActionDesc] = useState<string>('');
  const [actionResp, setActionResp] = useState<string>('');
  const [actionDate, setActionDate] = useState<string>('');
  const [actionPriority, setActionPriority] = useState<ActionPriority>('medium');

  useEffect(() => {
    if (checklistConfig.length > 0 && !activeSectionId) {
      setActiveSectionId(checklistConfig[0].id);
    }
  }, [checklistConfig, activeSectionId]);

  if (!activeEvaluation) {
    return (
      <section className="bg-white rounded-2xl p-10 shadow-sm text-center">
        <p className="text-lg mb-4">No hay evaluación activa.</p>
        <button
          onClick={() => onNavigate('inicio')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold"
        >
          Volver al Inicio
        </button>
      </section>
    );
  }

  const activeSection = checklistConfig.find((s) => s.id === activeSectionId);
  const sectionAnswers = activeEvaluation.answers[activeSectionId] || [];

  function handleAnswerClick(sectionId: string, qIndex: number, value: number) {
    if (value === 0) {
      // Open Three Whys modal
      const questionId = `${activeEvaluation!.id}-${sectionId}-${qIndex}`;
      const existing = activeEvaluation!.threeWhys[questionId];
      setWhy1(existing?.why1 || '');
      setWhy2(existing?.why2 || '');
      setWhy3(existing?.why3 || '');
      setWhysModal({ sectionId, qIndex });
    } else {
      setAnswer(sectionId, qIndex, 1);
      const questionId = `${activeEvaluation!.id}-${sectionId}-${qIndex}`;
      removePendingAction(questionId);
    }
  }

  function handleWhysSubmit() {
    if (!whysModal || !why1.trim() || !why2.trim() || !why3.trim()) {
      showAlert('error', 'Completa los 3 porqués.');
      return;
    }
    const whysData: ThreeWhys = { why1, why2, why3 };
    setWhysModal(null);

    // Open action modal
    const questionId = `${activeEvaluation!.id}-${whysModal.sectionId}-${whysModal.qIndex}`;
    const existing = activeEvaluation!.pendingActions[questionId];
    setActionDesc(existing?.description || '');
    setActionResp(existing?.responsible || '');
    setActionDate(existing?.dueDate || '');
    setActionPriority((existing?.priority as ActionPriority) || 'medium');
    setActionModal({ sectionId: whysModal.sectionId, qIndex: whysModal.qIndex, whys: whysData });
  }

  function handleActionSubmit() {
    if (!actionModal || !actionDesc.trim() || !actionResp.trim()) {
      showAlert('error', 'Descripción y responsable son obligatorios.');
      return;
    }

    const { sectionId, qIndex, whys } = actionModal;
    const questionId = `${activeEvaluation!.id}-${sectionId}-${qIndex}`;
    const section = checklistConfig.find((s) => s.id === sectionId)!;
    const now = new Date().toISOString();
    const existing = activeEvaluation!.pendingActions[questionId];

    setAnswer(sectionId, qIndex, 0);
    setThreeWhys(questionId, whys);
    setPendingAction(questionId, {
      id: `action_${activeEvaluation!.id}_${sectionId}_${qIndex}`,
      evaluationId: activeEvaluation!.id,
      sectionId,
      questionIndex: qIndex,
      questionText: section.questions[qIndex],
      threeWhys: whys,
      description: actionDesc,
      responsible: actionResp,
      dueDate: actionDate,
      priority: actionPriority,
      status: 'new',
      addedToPlan: true,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      evidenceIds: [],
      tags: [],
    });

    setActionModal(null);
    showAlert('success', 'Incidencia y acción correctiva registradas.');
  }

  async function handleFileUpload(files: FileList) {
    if (!attachModal) return;
    const questionId = `${activeEvaluation!.id}-${attachModal.sectionId}-${attachModal.qIndex}`;

    for (const file of Array.from(files)) {
      const att = {
        id: `attach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        parentId: questionId,
        fileName: file.name,
        fileType: file.type,
        fileData: file,
      };
      await dbService.saveAttachment(att);
      addAttachment(questionId, { id: att.id, fileName: att.fileName });
    }
    showAlert('success', 'Archivo(s) adjuntado(s).');
  }

  async function handleDeleteAttachment(questionId: string, attId: string) {
    await dbService.deleteAttachment(attId);
    removeAttachment(questionId, attId);
  }

  async function handleFinish() {
    const success = await finishEvaluation();
    if (success) onNavigate('inicio');
  }

  const canFinish = isEvaluationComplete();

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Section Tabs */}
      <nav className="flex gap-1 p-3 bg-gray-50 overflow-x-auto border-b">
        {checklistConfig.map((section) => {
          const answers = activeEvaluation.answers[section.id] || [];
          const answered = answers.filter((a) => a !== null).length;
          const total = section.questions.length;
          const complete = answered === total;
          const isActive = activeSectionId === section.id;

          return (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? `${SECTION_COLORS[section.id]} text-white`
                  : 'text-text-secondary hover:bg-gray-200'
              }`}
            >
              {SECTION_ICONS[section.icon] || <Shield className="h-4 w-4" />}
              <span className="hidden md:inline">{section.title}</span>
              {complete ? (
                <CheckCircle className="h-4 w-4 text-green-300" />
              ) : (
                <span className="opacity-70">
                  ({answered}/{total})
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Questions */}
      <div className="p-4 space-y-2">
        {activeSection?.questions.map((question, qIndex) => {
          const answer = sectionAnswers[qIndex] ?? null;
          const questionId = `${activeEvaluation.id}-${activeSectionId}-${qIndex}`;
          const hasAction = !!activeEvaluation.pendingActions[questionId];
          const attachments = activeEvaluation.attachments[questionId] || [];

          return (
            <div
              key={qIndex}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                answer === 1
                  ? 'bg-success-light border-success/20'
                  : answer === 0
                    ? 'bg-danger-light border-danger/20'
                    : 'bg-white border-gray-100'
              }`}
            >
              {/* Question text and action buttons */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text">{question}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {hasAction && (
                    <button
                      onClick={() => {
                        const existing = activeEvaluation.pendingActions[questionId];
                        const whys = activeEvaluation.threeWhys[questionId];
                        if (whys) {
                          setActionDesc(existing?.description || '');
                          setActionResp(existing?.responsible || '');
                          setActionDate(existing?.dueDate || '');
                          setActionPriority((existing?.priority as ActionPriority) || 'medium');
                          setActionModal({
                            sectionId: activeSectionId,
                            qIndex,
                            whys,
                          });
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white border rounded-lg text-text-secondary hover:bg-gray-50"
                    >
                      <PenSquare className="h-3 w-3" /> Tarea
                    </button>
                  )}
                  <button
                    onClick={() => setAttachModal({ sectionId: activeSectionId, qIndex })}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-lg hover:bg-gray-50 ${
                      attachments.length > 0
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-white text-text-secondary'
                    }`}
                  >
                    <Paperclip className="h-3 w-3" />
                    {attachments.length > 0 ? `Ver (${attachments.length})` : 'Adjuntar'}
                  </button>
                </div>
              </div>

              {/* Answer buttons */}
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleAnswerClick(activeSectionId, qIndex, 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    answer === 1
                      ? 'bg-success text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-success-light'
                  }`}
                >
                  Sí
                </button>
                <button
                  onClick={() => handleAnswerClick(activeSectionId, qIndex, 0)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    answer === 0
                      ? 'bg-danger text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-danger-light'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Finish Button */}
      <div className="p-4 border-t text-center">
        <button
          onClick={handleFinish}
          disabled={!canFinish}
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle className="h-5 w-5" />
          Guardar y Salir de la Evaluación
        </button>
        {!canFinish && (
          <p className="text-xs text-text-light mt-2">
            Completa todas las preguntas de al menos un módulo para guardar.
          </p>
        )}
      </div>

      {/* ===== THREE WHYS MODAL ===== */}
      <Modal
        isOpen={!!whysModal}
        onClose={() => setWhysModal(null)}
        title="Paso 1/2: Análisis Causa Raíz"
        subtitle={
          whysModal
            ? checklistConfig.find((s) => s.id === whysModal.sectionId)?.questions[whysModal.qIndex]
            : ''
        }
        footer={
          <>
            <button
              onClick={() => setWhysModal(null)}
              className="px-4 py-2 bg-gray-100 text-text rounded-xl text-sm font-medium hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleWhysSubmit}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark"
            >
              Siguiente
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">1. ¿Por qué ocurrió la incidencia?</label>
            <textarea
              value={why1}
              onChange={(e) => setWhy1(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">2. ¿Por qué ocurrió eso?</label>
            <textarea
              value={why2}
              onChange={(e) => setWhy2(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              3. ¿Y por qué ocurrió eso? (Causa Raíz)
            </label>
            <textarea
              value={why3}
              onChange={(e) => setWhy3(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              rows={2}
              required
            />
          </div>
        </div>
      </Modal>

      {/* ===== CORRECTIVE ACTION MODAL ===== */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title="Paso 2/2: Acción Correctiva"
        subtitle={
          actionModal
            ? checklistConfig.find((s) => s.id === actionModal.sectionId)?.questions[
                actionModal.qIndex
              ]
            : ''
        }
        footer={
          <>
            <button
              onClick={() => setActionModal(null)}
              className="px-4 py-2 bg-gray-100 text-text rounded-xl text-sm font-medium hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleActionSubmit}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark"
            >
              Confirmar y Guardar
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Acción Requerida</label>
            <input
              type="text"
              value={actionDesc}
              onChange={(e) => setActionDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Responsable</label>
              <input
                type="text"
                value={actionResp}
                onChange={(e) => setActionResp(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Límite</label>
              <input
                type="date"
                value={actionDate}
                onChange={(e) => setActionDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prioridad</label>
            <select
              value={actionPriority}
              onChange={(e) => setActionPriority(e.target.value as ActionPriority)}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* ===== ATTACHMENTS MODAL ===== */}
      <Modal
        isOpen={!!attachModal}
        onClose={() => setAttachModal(null)}
        title="Archivos Adjuntos"
        subtitle={
          attachModal
            ? checklistConfig.find((s) => s.id === attachModal.sectionId)?.questions[
                attachModal.qIndex
              ]
            : ''
        }
        footer={
          <>
            <button
              onClick={() => setAttachModal(null)}
              className="px-4 py-2 bg-gray-100 text-text rounded-xl text-sm font-medium hover:bg-gray-200"
            >
              Cerrar
            </button>
            <label className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark cursor-pointer inline-flex items-center gap-2">
              <Paperclip className="h-4 w-4" /> Añadir Archivo(s)
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFileUpload(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          </>
        }
      >
        {attachModal && (
          <AttachmentList
            questionId={`${activeEvaluation.id}-${attachModal.sectionId}-${attachModal.qIndex}`}
            attachments={
              activeEvaluation.attachments[
                `${activeEvaluation.id}-${attachModal.sectionId}-${attachModal.qIndex}`
              ] || []
            }
            onDelete={handleDeleteAttachment}
          />
        )}
      </Modal>
    </div>
  );
}

function AttachmentList({
  questionId,
  attachments,
  onDelete,
}: {
  questionId: string;
  attachments: AttachmentReference[];
  onDelete: (questionId: string, attId: string) => void;
}) {
  if (attachments.length === 0) {
    return <p className="text-center text-text-light py-4">No hay archivos adjuntos.</p>;
  }

  return (
    <ul className="space-y-2">
      {attachments.map((att) => (
        <li
          key={att.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
        >
          <span className="flex items-center gap-2 text-sm truncate">
            <Paperclip className="h-4 w-4 text-text-light" />
            {att.fileName}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => dbService.downloadAttachment(att.id)}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-text-light"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('¿Eliminar este archivo?')) onDelete(questionId, att.id);
              }}
              className="p-1.5 rounded-lg hover:bg-danger-light text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
