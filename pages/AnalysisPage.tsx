// ============================================================================
//  CENTINELA — Analysis Page (COMPLETA)
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useEvaluation } from '@/context/EvaluationContext';
import * as dbService from '@/services/database.service';
import type { CompletedEvaluation, CorrectiveAction } from '@/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const MODULE_COLORS: Record<string, string> = {
  disciplina: '#3b82f6',
  entorno: '#10b981',
  operacion: '#8b5cf6',
  vigilancia: '#f97316',
  respuesta: '#ef4444',
};

export function AnalysisPage() {
  const { checklistConfig } = useEvaluation();
  const [evaluations, setEvaluations] = useState<CompletedEvaluation[]>([]);
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [evals, acts] = await Promise.all([
        dbService.getAllEvaluations(),
        dbService.getAllCorrectiveActions(),
      ]);
      setEvaluations(evals.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setActions(acts);
      setIsLoaded(true);
    }
    load();
  }, []);

  // ---- Chart 1: Compliance by module (last evaluation) ----
  const lastEval = evaluations[evaluations.length - 1];

  const complianceByModule = useMemo(() => {
    if (!lastEval) return null;
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    checklistConfig.forEach((section) => {
      const score = lastEval.scores[section.id];
      if (score && score.total > 0) {
        labels.push(section.title.replace('Módulo ', 'M'));
        data.push(Math.round((score.score / score.total) * 100));
        colors.push(MODULE_COLORS[section.id] || '#6b7280');
      }
    });

    return {
      labels,
      datasets: [{ label: 'Cumplimiento %', data, backgroundColor: colors, borderRadius: 8 }],
    };
  }, [lastEval, checklistConfig]);

  // ---- Chart 2: Trend over time ----
  const trendData = useMemo(() => {
    if (evaluations.length === 0) return null;
    const last10 = evaluations.slice(-10);
    return {
      labels: last10.map((e) =>
        new Date(e.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      ),
      datasets: [
        {
          label: 'Cumplimiento Global %',
          data: last10.map((e) => Math.round(e.compliance)),
          borderColor: '#007BFF',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#007BFF',
        },
      ],
    };
  }, [evaluations]);

  // ---- Chart 3: Top 5 problemas (preguntas con más "No") ----
  const topProblems = useMemo(() => {
    if (evaluations.length === 0) return [];
    const problemCount: Record<string, { text: string; count: number }> = {};

    evaluations.forEach((ev) => {
      checklistConfig.forEach((section) => {
        const answers = ev.answers?.[section.id];
        if (!answers) return;
        answers.forEach((val, qi) => {
          if (val === 0) {
            const key = `${section.id}-${qi}`;
            if (!problemCount[key]) {
              problemCount[key] = { text: section.questions[qi] || `${section.title} P${qi + 1}`, count: 0 };
            }
            problemCount[key].count++;
          }
        });
      });
    });

    return Object.values(problemCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [evaluations, checklistConfig]);

  // ---- Chart 4: Action status distribution ----
  const actionDistribution = useMemo(() => {
    if (actions.length === 0) return null;
    const statusCount: Record<string, number> = {};
    actions.forEach((a) => {
      statusCount[a.status] = (statusCount[a.status] || 0) + 1;
    });

    const statusLabels: Record<string, string> = {
      new: 'Nueva', planned: 'Planificada', in_progress: 'En Progreso',
      pending_verification: 'Verificación', completed: 'Completada', cancelled: 'Cancelada',
    };
    const statusColors: Record<string, string> = {
      new: '#3b82f6', planned: '#8b5cf6', in_progress: '#f59e0b',
      pending_verification: '#f97316', completed: '#16a34a', cancelled: '#6b7280',
    };

    const labels = Object.keys(statusCount).map((k) => statusLabels[k] || k);
    const data = Object.values(statusCount);
    const colors = Object.keys(statusCount).map((k) => statusColors[k] || '#6b7280');

    return { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] };
  }, [actions]);

  // ---- Chart 5: Effectiveness by responsible ----
  const responsibleData = useMemo(() => {
    if (actions.length === 0) return [];
    const byResp: Record<string, { total: number; completed: number }> = {};
    actions.forEach((a) => {
      if (!byResp[a.responsible]) byResp[a.responsible] = { total: 0, completed: 0 };
      byResp[a.responsible].total++;
      if (a.status === 'completed') byResp[a.responsible].completed++;
    });
    return Object.entries(byResp)
      .map(([name, d]) => ({ name, total: d.total, completed: d.completed, pct: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [actions]);

  if (!isLoaded) return null;

  if (evaluations.length === 0) {
    return (
      <section className="bg-white rounded-2xl p-10 shadow-sm text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-xl font-bold mb-2">Análisis de Patrones</h2>
        <p className="text-text-secondary">Realiza al menos una evaluación para ver los análisis.</p>
      </section>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5" /> Análisis de Patrones
          <span className="text-sm font-normal text-text-light">({evaluations.length} evaluaciones)</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance by module */}
          {complianceByModule && (
            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-3">Cumplimiento por Módulo (Última)</h3>
              <div className="h-64">
                <Bar data={complianceByModule} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Trend */}
          {trendData && (
            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-3">Tendencia de Cumplimiento</h3>
              <div className="h-64">
                <Line data={trendData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          )}

          {/* Top 5 problems */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-3">Top 5 Problemas Recurrentes</h3>
            {topProblems.length === 0 ? (
              <p className="text-sm text-text-light py-4 text-center">No hay incumplimientos registrados.</p>
            ) : (
              <div className="space-y-3">
                {topProblems.map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-7 w-7 rounded-full bg-danger text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text truncate">{p.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-danger rounded-full"
                            style={{ width: `${Math.min((p.count / evaluations.length) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-light font-medium">{p.count}x</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action distribution */}
          {actionDistribution && (
            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-3">Distribución de Acciones</h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  data={actionDistribution}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Effectiveness by responsible */}
        {responsibleData.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-5 mt-6">
            <h3 className="font-bold text-sm mb-3">Efectividad por Responsable</h3>
            <div className="space-y-3">
              {responsibleData.map((r) => (
                <div key={r.name} className="flex items-center gap-3">
                  <span className="w-28 text-sm font-medium text-text truncate">{r.name}</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full transition-all" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-xs text-text-secondary w-24 text-right">
                    {r.completed}/{r.total} ({r.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
