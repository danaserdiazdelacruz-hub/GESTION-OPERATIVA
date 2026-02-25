// ============================================================================
//  CENTINELA — App Shell
// ============================================================================

import { useState } from 'react';
import { Header } from './Header';
import { TabNavigation, type TabId } from './TabNavigation';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/types';
import { TAB_PERMISSIONS } from '@/config/constants';
import { HomePage } from '@/pages/HomePage';
import {
  ChecklistPage,
  HistoryPage,
  ActionPlanPage,
  AnalysisPage,
  ConfigPage,
  AccessDeniedPage,
} from '@/pages/PlaceholderPages';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('inicio');
  const { hasPermission } = useAuth();

  function renderContent() {
    // Verificar permisos
    const requiredPermission = TAB_PERMISSIONS[activeTab];
    if (requiredPermission && !hasPermission(requiredPermission as Permission)) {
      return <AccessDeniedPage />;
    }

    switch (activeTab) {
      case 'inicio':
        return <HomePage onNavigate={setActiveTab} />;
      case 'checklist':
        return <ChecklistPage />;
      case 'historial':
        return <HistoryPage />;
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
