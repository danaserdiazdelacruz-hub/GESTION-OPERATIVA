// ============================================================================
//  CENTINELA — Tab Navigation
// ============================================================================

import {
  Home,
  Clock,
  ClipboardList,
  BarChart3,
  PlusCircle,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEvaluation } from '@/context/EvaluationContext';
import { Permission } from '@/types';
import type { ReactNode } from 'react';

export type TabId =
  | 'inicio'
  | 'historial'
  | 'action_plan'
  | 'analysis'
  | 'checklist'
  | 'config';

interface TabDef {
  id: TabId;
  text: string;
  icon: ReactNode;
  permission: Permission | null;
}

const TABS: TabDef[] = [
  { id: 'inicio', text: 'Inicio', icon: <Home className="h-4 w-4" />, permission: null },
  { id: 'historial', text: 'Historial', icon: <Clock className="h-4 w-4" />, permission: Permission.EVALUATIONS_READ },
  { id: 'action_plan', text: 'Plan Acción', icon: <ClipboardList className="h-4 w-4" />, permission: Permission.ACTIONS_MANAGE },
  { id: 'analysis', text: 'Análisis', icon: <BarChart3 className="h-4 w-4" />, permission: Permission.ANALYSIS_READ },
  { id: 'checklist', text: 'Evaluación', icon: <PlusCircle className="h-4 w-4" />, permission: Permission.EVALUATIONS_CREATE },
  { id: 'config', text: 'Config.', icon: <Settings className="h-4 w-4" />, permission: Permission.CONFIG_READ },
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { hasPermission } = useAuth();
  const { activeEvaluation, startNewEvaluation } = useEvaluation();

  const availableTabs = TABS.filter(
    (tab) => tab.permission === null || hasPermission(tab.permission)
  );

  function handleTabClick(tabId: TabId) {
    if (tabId === 'checklist') {
      if (activeEvaluation) {
        onTabChange('checklist');
      } else {
        const started = startNewEvaluation();
        if (started) onTabChange('checklist');
      }
    } else {
      onTabChange(tabId);
    }
  }

  return (
    <nav className="flex gap-1 bg-white rounded-2xl p-2 shadow-sm mb-4 overflow-x-auto">
      {availableTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const hasPending = tab.id === 'checklist' && !!activeEvaluation;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
              transition-all whitespace-nowrap
              ${isActive
                ? 'bg-primary text-white shadow-glow'
                : 'text-text-secondary hover:bg-surface hover:text-text'
              }
              ${hasPending && !isActive ? 'ring-2 ring-warning ring-offset-1' : ''}
            `}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.text}</span>
          </button>
        );
      })}
    </nav>
  );
}
