// ============================================================================
//  CENTINELA — Placeholder Pages (Fase 3–5)
//  Cada una será reemplazada con su implementación completa.
// ============================================================================

import { PlusCircle, Clock, ClipboardList, BarChart3, Settings, Lock } from 'lucide-react';

function PlaceholderSection({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <section className="bg-white rounded-2xl p-10 shadow-sm text-center">
      <div className="flex justify-center mb-4 text-primary">{icon}</div>
      <h2 className="text-xl font-bold text-text mb-2">{title}</h2>
      <p className="text-text-secondary">{description}</p>
      <div className="mt-6 inline-block px-4 py-2 bg-surface rounded-xl text-sm text-text-light font-medium">
        Próxima Fase de Desarrollo
      </div>
    </section>
  );
}

export function ChecklistPage() {
  return (
    <PlaceholderSection
      icon={<PlusCircle className="h-12 w-12" />}
      title="Evaluación / Checklist"
      description="Aquí irá el flujo completo de evaluación con los 5 módulos, preguntas Sí/No, análisis de causa raíz (3 Porqués), acciones correctivas y adjuntos."
    />
  );
}

export function HistoryPage() {
  return (
    <PlaceholderSection
      icon={<Clock className="h-12 w-12" />}
      title="Historial de Evaluaciones"
      description="Tarjetas de evaluaciones pasadas, filtros por fecha, detalle de informes y exportación a PDF."
    />
  );
}

export function ActionPlanPage() {
  return (
    <PlaceholderSection
      icon={<ClipboardList className="h-12 w-12" />}
      title="Plan de Acción Integral"
      description="Tabla de acciones correctivas con filtros, búsqueda, cambio de estado, historial de cambios y exportación CSV."
    />
  );
}

export function AnalysisPage() {
  return (
    <PlaceholderSection
      icon={<BarChart3 className="h-12 w-12" />}
      title="Análisis de Patrones"
      description="Gráficas de cumplimiento por módulo, tendencia histórica, los 5 problemas más comunes y efectividad por responsable."
    />
  );
}

export function ConfigPage() {
  return (
    <PlaceholderSection
      icon={<Settings className="h-12 w-12" />}
      title="Configuración"
      description="Cambio de contraseña, editor de checklist, gestión de usuarios y zona peligrosa de limpieza de datos."
    />
  );
}

export function AccessDeniedPage() {
  return (
    <section className="bg-white rounded-2xl p-10 shadow-sm text-center">
      <div className="flex justify-center mb-4 text-danger">
        <Lock className="h-12 w-12" />
      </div>
      <h2 className="text-xl font-bold text-text mb-2">Acceso Denegado</h2>
      <p className="text-text-secondary">No tienes permisos para ver esta sección.</p>
    </section>
  );
}
