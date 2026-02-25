// ============================================================================
//  CENTINELA — Home Page
// ============================================================================

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  ClipboardList,
  AlertTriangle,
  PlusCircle,
  Home,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEvaluation } from '@/context/EvaluationContext';
import { MetricCard } from '@/components/ui/MetricCard';
import * as dbService from '@/services/database.service';
import type { CompletedEvaluation, CorrectiveAction } from '@/types';
import type { TabId } from '@/components/layout/TabNavigation';

interface HomePageProps {
  onNavigate: (tab: TabId) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { currentUser } = useAuth();
  const { activeEvaluation, startNewEvaluation } = useEvaluation();
  const [lastEval, setLastEval] = useState<CompletedEvaluation | undefined>();
  const [openActions, setOpenActions] = useState<number>(0);
  const [overdueCount, setOverdueCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      const [evaluation, actionsCount, allActions] = await Promise.all([
        dbService.getLastEvaluation(),
        dbService.getOpenActionsCount(),
        dbService.getAllCorrectiveActions(),
      ]);
      setLastEval(evaluation);
      setOpenActions(actionsCount);
      setOverdueCount(
        allActions.filter(
          (a: CorrectiveAction) =>
            a.dueDate &&
            new Date(a.dueDate) < new Date() &&
            !['completed', 'cancelled'].includes(a.status)
        ).length
      );
      setIsLoaded(true);
    }
    loadData();
  }, []);

  if (!isLoaded || !currentUser) return null;

  function getVariant(value: number, threshold: number): 'success' | 'warning' | 'critical' {
    if (value === 0) return 'success';
    return value > threshold ? 'critical' : 'warning';
  }

  function handleStartEval() {
    const started = startNewEvaluation();
    if (started) onNavigate('checklist');
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section className="bg-white rounded-2xl p-6 shadow-sm text-center">
        <h2 className="text-xl font-bold text-text flex items-center justify-center gap-2">
          <Home className="h-6 w-6" />
          Bienvenido, {currentUser.displayName}
        </h2>
        <p className="text-text-secondary mt-1">
          Este es tu centro de mando para la seguridad operativa.
        </p>
      </section>

      {/* Active evaluation banner */}
      {activeEvaluation && (
        <div className="bg-warning-light border-l-4 border-warning rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-warning-dark">Evaluación en Curso</h3>
            <p className="text-sm text-text-secondary">
              Tienes un checklist pendiente de finalizar.
            </p>
          </div>
          <button
            onClick={() => onNavigate('checklist')}
            className="px-4 py-2 bg-warning text-white rounded-xl text-sm font-semibold hover:bg-warning-dark transition-colors"
          >
            Continuar
          </button>
        </div>
      )}

      {/* No evaluations yet */}
      {!lastEval && (
        <section className="bg-white rounded-2xl p-10 shadow-sm text-center">
          <p className="text-lg mb-6">
            Aún no has realizado ninguna evaluación. ¡Empieza ahora para analizar tu estado de
            seguridad!
          </p>
          <button
            onClick={handleStartEval}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-glow"
          >
            <PlusCircle className="h-5 w-5" />
            Realizar Primera Evaluación
          </button>
        </section>
      )}

      {/* Dashboard metrics */}
      {lastEval && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            icon={<CheckCircle className="h-8 w-8" />}
            value={lastEval.compliance.toFixed(0)}
            suffix="%"
            label={`Último Cumplimiento (${new Date(lastEval.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })})`}
            variant={
              lastEval.compliance < 70
                ? 'critical'
                : lastEval.compliance < 90
                  ? 'warning'
                  : 'success'
            }
          />
          <MetricCard
            icon={<ClipboardList className="h-8 w-8" />}
            value={openActions}
            label="Acciones Abiertas"
            variant={getVariant(openActions, 5)}
          />
          <MetricCard
            icon={<AlertTriangle className="h-8 w-8" />}
            value={overdueCount}
            label="Acciones Vencidas"
            variant={getVariant(overdueCount, 0)}
          />
        </div>
      )}
    </div>
  );
}
