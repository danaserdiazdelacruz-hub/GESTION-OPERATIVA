// ============================================================================
//  CENTINELA — App Shell (TODAS LAS PÁGINAS REALES)
// ============================================================================

import { useState } from 'react';
import { Header } from './Header';
import { TabNavigation, type TabId } from './TabNavigation';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/types';
import { TAB_PERMISSIONS } from '@/config/constants';
import { HomePage } from '@/pages/HomePage';
import { ChecklistPage } from '@/pages/ChecklistPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ActionPlanPage } from '@/pages/ActionPlanPage';
import { AnalysisPage } from '@/pages/AnalysisPage';
import { ConfigPage } from '@/pages/ConfigPage';
import { Lock } from 'lucide-react';

function AccessDeniedPage() {
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

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('inicio');
  const { hasPermission } = useAuth();

  function renderContent() {
    const requiredPermission = TAB_PERMISSIONS[activeTab];
    if (requiredPermission && !hasPermission(requiredPermission as Permission)) {
      return <AccessDeniedPage />;
    }

    switch (activeTab) {
      case 'inicio':
        return <HomePage onNavigate={setActiveTab} />;
      case 'checklist':
        return <ChecklistPage onNavigate={setActiveTab} />;
      case 'historial':
        return <HistoryPage onNavigate={setActiveTab} />;
      case 'action_plan':
        return <ActionPlanPage />;
      case 'analysis':
        return <AnalysisPage />;
      case 'config':
        return <ConfigPage />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main>{renderContent()}</main>
    </div>
  );
}
