// ============================================================================
//  CENTINELA — Alert Toast
// ============================================================================

import { CheckCircle, AlertTriangle, Shield, X } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';

const iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Shield,
};

const colorMap = {
  success: 'border-success bg-success-light text-success-dark',
  error: 'border-danger bg-danger-light text-danger-dark',
  warning: 'border-warning bg-warning-light text-warning-dark',
  info: 'border-primary bg-blue-50 text-primary-dark',
};

export function AlertContainer() {
  const { alerts, removeAlert } = useAlert();

  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-3 max-w-sm">
      {alerts.map((alert) => {
        const Icon = iconMap[alert.type];
        return (
          <div
            key={alert.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-lg animate-slide-in ${colorMap[alert.type]}`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{alert.message}</p>
            <button
              onClick={() => removeAlert(alert.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
