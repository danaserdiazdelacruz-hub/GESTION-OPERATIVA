// ============================================================================
//  CENTINELA — History Page (COMPLETA)
// ============================================================================

import { useState, useEffect } from 'react';
import { Clock, Eye, Trash2, Download, PlusCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { useEvaluation } from '@/context/EvaluationContext';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ACTION_STATUSES } from '@/config/action-state-machine';
import * as dbService from '@/services/database.service';
import type { CompletedEvaluation, CorrectiveAction } from '@/types';
import { Permission } from '@/types';
import type { TabId } from '@/components/layout/TabNavigation';

interface HistoryPageProps {
  onNavigate: (tab: TabId) => void;
}

export function HistoryPage({ onNavigate }: HistoryPageProps) {
  const { hasPermission } = useAuth();
  const { showAlert } = useAlert();
  const { checklistConfig, startNewEvaluation } = useEvaluation();
  const [evaluations, setEvaluations] = useState<CompletedEvaluation[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [detailEval, setDetailEval] = useState<CompletedEvaluation | null>(null);
  const [detailActions, setDetailActions] = useState<CorrectiveAction[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  async function loadData() {
    const data = await dbService.getAllEvaluations();
    setEvaluations(data);
    setIsLoaded(true);
  }

  useEffect(() => { loadData(); }, []);

  function getFiltered(): CompletedEvaluation[] {
    let filtered = [...evaluations];
    if (startDate) filtered = filtered.filter((ev) => new Date(ev.createdAt) >= new Date(startDate + 'T00:00:00'));
    if (endDate) filtered = filtered.filter((ev) => new Date(ev.createdAt) <= new Date(endDate + 'T23:59:59'));
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  function getScoreStatus(pct: number): string {
    if (pct < 70) return 'critical';
    if (pct < 90) return 'warning';
    return 'optimal';
  }

  async function handleDelete(id: string) {
    const ev = evaluations.find((e) => e.id === id);
    if (!ev) return;
    const date = new Date(ev.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' });
    if (confirm(`¿Eliminar permanentemente el informe del ${date}?`)) {
      await dbService.deleteEvaluations([id]);
      showAlert('success', 'Informe eliminado.');
      loadData();
    }
  }

  async function openDetail(id: string) {
    const [ev, actions] = await Promise.all([
      dbService.getEvaluationById(id),
      dbService.getAllCorrectiveActions(),
    ]);
    if (ev) {
      setDetailEval(ev);
      setDetailActions(actions.filter((a) => a.evaluationId === id));
    }
  }

  function handleQuickRange(range: string) {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    switch (range) {
      case 'today':
        setStartDate(fmt(today));
        setEndDate(fmt(today));
        break;
      case 'week': {
        const week = new Date();
        week.setDate(today.getDate() - 6);
        setStartDate(fmt(week));
        setEndDate(fmt(today));
        break;
      }
      case 'month': {
        setStartDate(fmt(new Date(today.getFullYear(), today.getMonth(), 1)));
        setEndDate(fmt(new Date(today.getFullYear(), today.getMonth() + 1, 0)));
        break;
      }
      case 'clear':
        setStartDate('');
        setEndDate('');
        break;
    }
  }

  if (!isLoaded) return null;

  const filtered = getFiltered();

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5" /> Historial de Evaluaciones
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => handleQuickRange('today')} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Hoy</button>
          <button onClick={() => handleQuickRange('week')} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Últimos 7 días</button>
          <button onClick={() => handleQuickRange('month')} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Este mes</button>
          <button onClick={() => handleQuickRange('clear')} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Todos</button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-text-light" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm" />
            <span className="text-text-light text-sm">hasta</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm" />
          </div>
        </div>

        {evaluations.length === 0 ? (
          <div className="text-center py-10">
            <p className="mb-4">Aún no se han completado evaluaciones.</p>
            <button
              onClick={() => {
                if (startNewEvaluation()) onNavigate('checklist');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold"
            >
              <PlusCircle className="h-5 w-5" /> Realizar Primera Evaluación
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ev) => {
              const date = new Date(ev.createdAt);
              const status = getScoreStatus(ev.compliance);
              return (
                <div key={ev.id} className="relative bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
                  {hasPermission(Permission.EVALUATIONS_DELETE) && (
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-text-light hover:bg-danger-light hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-text">{date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div className="text-xs text-text-light">a las {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className={`text-2xl font-extrabold ${status === 'optimal' ? 'text-success' : status === 'warning' ? 'text-warning' : 'text-danger'}`}>
                      {ev.compliance.toFixed(0)}%
                    </div>
                  </div>

                  {/* Category badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {Object.entries(ev.scores).map(([sectionId, score]) => {
                      const section = checklistConfig.find((s) => s.id === sectionId);
                      if (!section) return null;
                      return (
                        <span key={sectionId} className={`text-[10px] px-2 py-0.5 rounded-full text-white font-medium ${SECTION_COLORS[sectionId] || 'bg-gray-400'}`}>
                          {section.title} ({score.score}/{score.total})
                        </span>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => openDetail(ev.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-white border rounded-xl text-sm font-medium text-text-secondary hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4" /> VER INFORME
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full text-center py-6 text-text-light">No se encontraron evaluaciones con los filtros seleccionados.</p>
            )}
          </div>
        )}
      </section>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailEval}
        onClose={() => setDetailEval(null)}
        title="Informe de Evaluación"
        subtitle={detailEval ? new Date(detailEval.createdAt).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' }) : ''}
        maxWidth="max-w-3xl"
        footer={
          <button onClick={() => setDetailEval(null)} className="px-4 py-2 bg-gray-100 text-text rounded-xl text-sm font-medium hover:bg-gray-200">
            Cerrar
          </button>
        }
      >
        {detailEval && (
          <div className="space-y-6">
            <div className="text-center">
              <span className={`text-4xl font-extrabold ${getScoreStatus(detailEval.compliance) === 'optimal' ? 'text-success' : getScoreStatus(detailEval.compliance) === 'warning' ? 'text-warning' : 'text-danger'}`}>
                {detailEval.compliance.toFixed(0)}%
              </span>
              <p className="text-sm text-text-light mt-1">Cumplimiento Global</p>
            </div>

            {checklistConfig.map((section) => {
              const scoreData = detailEval.scores[section.id];
              if (!scoreData || scoreData.total === 0) return null;
              const pct = (scoreData.score / scoreData.total) * 100;

              return (
                <div key={section.id} className={`border-t-4 rounded-xl p-4 bg-gray-50`} style={{ borderColor: `var(--color-${section.id})` }}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm">{section.title}</h4>
                    <StatusBadge status={getScoreStatus(pct)}>{pct.toFixed(0)}%</StatusBadge>
                  </div>
                  <div className="space-y-2">
                    {section.questions.map((q, qi) => {
                      const val = detailEval.answers?.[section.id]?.[qi];
                      const isYes = val === 1;
                      const action = detailActions.find((a) => a.sectionId === section.id && a.questionIndex === qi);
                      return (
                        <div key={qi} className="text-sm">
                          <div className="flex items-start gap-2">
                            <span className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${isYes ? 'bg-success' : 'bg-danger'}`}>
                              {isYes ? '✓' : '✗'}
                            </span>
                            <span className="text-text-secondary">{q}</span>
                          </div>
                          {action && (
                            <div className="ml-7 mt-1 p-2 bg-danger-light border-l-2 border-danger rounded text-xs">
                              <p><strong>Causa Raíz:</strong> {action.threeWhys?.why3 || 'N/A'}</p>
                              <p><strong>Acción:</strong> {action.description}</p>
                              <p><strong>Responsable:</strong> {action.responsible} · <StatusBadge status={action.status}>{ACTION_STATUSES[action.status] || action.status}</StatusBadge></p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}

const SECTION_COLORS: Record<string, string> = {
  disciplina: 'bg-blue-500',
  entorno: 'bg-emerald-500',
  operacion: 'bg-violet-500',
  vigilancia: 'bg-orange-500',
  respuesta: 'bg-red-500',
};
