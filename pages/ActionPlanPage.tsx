// ============================================================================
//  CENTINELA — Action Plan Page (COMPLETA)
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ACTION_STATUSES, getValidNextStates } from '@/config/action-state-machine';
import * as dbService from '@/services/database.service';
import type { CorrectiveAction, ActionHistory, ActionStatusKey } from '@/types';
import { Permission } from '@/types';

const PRIORITY_LABELS: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta' };
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export function ActionPlanPage() {
  const { currentUser, hasPermission } = useAuth();
  const { showAlert } = useAlert();

  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterResp, setFilterResp] = useState('all');

  // Sort
  const [sortCol, setSortCol] = useState<string>('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Detail modal
  const [detailAction, setDetailAction] = useState<CorrectiveAction | null>(null);
  const [detailHistory, setDetailHistory] = useState<ActionHistory[]>([]);

  // Status change modal
  const [statusModal, setStatusModal] = useState<CorrectiveAction | null>(null);
  const [newStatus, setNewStatus] = useState<ActionStatusKey>('new');
  const [statusComment, setStatusComment] = useState('');

  async function loadActions() {
    const data = await dbService.getAllCorrectiveActions();
    setActions(data);
    setIsLoaded(true);
  }

  useEffect(() => { loadActions(); }, []);

  // Get unique responsibles for filter dropdown
  const responsibles = useMemo(() => {
    const set = new Set(actions.map((a) => a.responsible).filter(Boolean));
    return Array.from(set).sort();
  }, [actions]);

  // Filter and sort
  const filtered = useMemo(() => {
    let result = [...actions];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.description.toLowerCase().includes(q) ||
          a.questionText.toLowerCase().includes(q) ||
          a.responsible.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') result = result.filter((a) => a.status === filterStatus);
    if (filterPriority !== 'all') result = result.filter((a) => a.priority === filterPriority);
    if (filterResp !== 'all') result = result.filter((a) => a.responsible === filterResp);

    result.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      switch (sortCol) {
        case 'dueDate':
          valA = a.dueDate || '9999';
          valB = b.dueDate || '9999';
          break;
        case 'priority':
          const pOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          valA = pOrder[a.priority] ?? 1;
          valB = pOrder[b.priority] ?? 1;
          break;
        case 'status':
          valA = a.status;
          valB = b.status;
          break;
        case 'responsible':
          valA = a.responsible.toLowerCase();
          valB = b.responsible.toLowerCase();
          break;
        default:
          valA = a.createdAt;
          valB = b.createdAt;
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [actions, searchQuery, filterStatus, filterPriority, filterResp, sortCol, sortDir]);

  function toggleSort(col: string) {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

  function SortIcon({ col }: { col: string }) {
    if (sortCol !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  }

  async function openDetail(action: CorrectiveAction) {
    const history = await dbService.getActionHistory(action.id);
    setDetailAction(action);
    setDetailHistory(history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }

  function openStatusChange(action: CorrectiveAction) {
    const validNext = getValidNextStates(action.status);
    if (validNext.length === 0) {
      showAlert('warning', 'No hay transiciones válidas para este estado.');
      return;
    }
    setStatusModal(action);
    setNewStatus(validNext[0]);
    setStatusComment('');
  }

  async function handleStatusChange() {
    if (!statusModal || !currentUser) return;
    await dbService.updateActionStatus(statusModal.id, newStatus, currentUser.displayName, statusComment);
    showAlert('success', `Estado cambiado a "${ACTION_STATUSES[newStatus]}".`);
    setStatusModal(null);
    loadActions();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta acción correctiva permanentemente?')) return;
    await dbService.deleteAction(id);
    showAlert('success', 'Acción eliminada.');
    loadActions();
  }

  function exportCSV() {
    const headers = ['Descripción', 'Pregunta', 'Responsable', 'Fecha Límite', 'Prioridad', 'Estado', 'Causa Raíz'];
    const rows = filtered.map((a) => [
      a.description,
      a.questionText,
      a.responsible,
      a.dueDate || 'N/A',
      PRIORITY_LABELS[a.priority] || a.priority,
      ACTION_STATUSES[a.status] || a.status,
      a.threeWhys?.why3 || 'N/A',
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan_accion_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('success', 'CSV exportado.');
  }

  function isOverdue(action: CorrectiveAction): boolean {
    return (
      !!action.dueDate &&
      new Date(action.dueDate) < new Date() &&
      !['completed', 'cancelled'].includes(action.status)
    );
  }

  if (!isLoaded) return null;

  const overdueCount = actions.filter(isOverdue).length;

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> Plan de Acción Integral
            <span className="text-sm font-normal text-text-light">({filtered.length} acciones)</span>
          </h2>
          <div className="flex gap-2">
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-danger-light text-danger-dark rounded-lg text-xs font-bold">
                <AlertTriangle className="h-3.5 w-3.5" /> {overdueCount} vencida(s)
              </span>
            )}
            <button onClick={exportCSV} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium hover:bg-gray-200">
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-xl text-sm">
            <option value="all">Todos los estados</option>
            {Object.entries(ACTION_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3 py-2 border rounded-xl text-sm">
            <option value="all">Toda prioridad</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
          <select value={filterResp} onChange={(e) => setFilterResp(e.target.value)} className="px-3 py-2 border rounded-xl text-sm">
            <option value="all">Todos responsables</option>
            {responsibles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {actions.length === 0 ? (
          <p className="text-center py-10 text-text-light">No hay acciones correctivas registradas.</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-10 text-text-light">No se encontraron resultados con los filtros seleccionados.</p>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-text-light uppercase">
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('description')}>Descripción <SortIcon col="description" /></th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('responsible')}>Responsable <SortIcon col="responsible" /></th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('dueDate')}>Fecha Límite <SortIcon col="dueDate" /></th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('priority')}>Prioridad <SortIcon col="priority" /></th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('status')}>Estado <SortIcon col="status" /></th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((action) => {
                  const overdue = isOverdue(action);
                  return (
                    <tr key={action.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${overdue ? 'bg-danger-light/50' : ''}`}>
                      <td className="px-4 py-3 max-w-[250px]">
                        <div className="font-medium text-text truncate">{action.description}</div>
                        <div className="text-xs text-text-light truncate">{action.questionText}</div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{action.responsible}</td>
                      <td className="px-4 py-3">
                        {action.dueDate ? (
                          <span className={overdue ? 'text-danger font-bold' : 'text-text-secondary'}>
                            {new Date(action.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            {overdue && ' ⚠'}
                          </span>
                        ) : (
                          <span className="text-text-light">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[action.priority] || ''}`}>
                          {PRIORITY_LABELS[action.priority] || action.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openStatusChange(action)} title="Cambiar estado">
                          <StatusBadge status={action.status}>
                            {ACTION_STATUSES[action.status] || action.status}
                          </StatusBadge>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openDetail(action)} className="p-1.5 rounded-lg hover:bg-gray-200 text-text-light" title="Ver detalle">
                            <Eye className="h-4 w-4" />
                          </button>
                          {hasPermission(Permission.ACTIONS_DELETE) && (
                            <button onClick={() => handleDelete(action.id)} className="p-1.5 rounded-lg hover:bg-danger-light text-danger" title="Eliminar">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailAction}
        onClose={() => setDetailAction(null)}
        title="Detalle de Acción Correctiva"
        maxWidth="max-w-2xl"
        footer={<button onClick={() => setDetailAction(null)} className="px-4 py-2 bg-gray-100 text-text rounded-xl text-sm font-medium hover:bg-gray-200">Cerrar</button>}
      >
        {detailAction && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-light mb-1">Descripción</p>
                <p className="text-sm font-medium">{detailAction.description}</p>
              </div>
              <div>
                <p className="text-xs text-text-light mb-1">Pregunta Origen</p>
                <p className="text-sm">{detailAction.questionText}</p>
              </div>
              <div>
                <p className="text-xs text-text-light mb-1">Responsable</p>
                <p className="text-sm font-medium">{detailAction.responsible}</p>
              </div>
              <div>
                <p className="text-xs text-text-light mb-1">Fecha Límite</p>
                <p className="text-sm">{detailAction.dueDate ? new Date(detailAction.dueDate).toLocaleDateString('es-ES', { dateStyle: 'long' }) : 'Sin fecha'}</p>
              </div>
              <div>
                <p className="text-xs text-text-light mb-1">Prioridad</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[detailAction.priority]}`}>
                  {PRIORITY_LABELS[detailAction.priority]}
                </span>
              </div>
              <div>
                <p className="text-xs text-text-light mb-1">Estado</p>
                <StatusBadge status={detailAction.status}>{ACTION_STATUSES[detailAction.status]}</StatusBadge>
              </div>
            </div>

            {detailAction.threeWhys && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-sm mb-2">Análisis 3 Porqués</h4>
                <p className="text-sm"><strong>1.</strong> {detailAction.threeWhys.why1}</p>
                <p className="text-sm"><strong>2.</strong> {detailAction.threeWhys.why2}</p>
                <p className="text-sm text-danger-dark"><strong>3. Causa Raíz:</strong> {detailAction.threeWhys.why3}</p>
              </div>
            )}

            {detailHistory.length > 0 && (
              <div>
                <h4 className="font-bold text-sm mb-2">Historial de Cambios</h4>
                <div className="space-y-2">
                  {detailHistory.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs border-l-2 border-primary/30 pl-3 py-1">
                      <span className="text-text-light whitespace-nowrap">{new Date(h.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      <StatusBadge status={h.status}>{ACTION_STATUSES[h.status]}</StatusBadge>
                      <span className="text-text-secondary">{h.changedBy}</span>
                      {h.comment && <span className="italic text-text-light">"{h.comment}"</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Cambiar Estado"
        subtitle={statusModal?.description}
        footer={
          <>
            <button onClick={() => setStatusModal(null)} className="px-4 py-2 bg-gray-100 text-text rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button>
            <button onClick={handleStatusChange} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark">Confirmar</button>
          </>
        }
      >
        {statusModal && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-text-light mb-1">Estado actual</p>
              <StatusBadge status={statusModal.status}>{ACTION_STATUSES[statusModal.status]}</StatusBadge>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nuevo Estado</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ActionStatusKey)}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {getValidNextStates(statusModal.status).map((s) => (
                  <option key={s} value={s}>{ACTION_STATUSES[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comentario (opcional)</label>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                rows={2}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
