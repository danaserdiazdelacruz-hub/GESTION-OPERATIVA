// ============================================================================
//  CENTINELA — Alert Context
// ============================================================================

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface Alert {
  id: string;
  type: AlertType;
  message: string;
}

interface AlertContextValue {
  alerts: Alert[];
  showAlert: (type: AlertType, message: string, duration?: number) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback(
    (type: AlertType, message: string, duration = 4000) => {
      const id = `alert_${Date.now()}_${Math.random()}`;
      setAlerts((prev) => [{ id, type, message }, ...prev]);

      setTimeout(() => {
        removeAlert(id);
      }, duration);
    },
    [removeAlert]
  );

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextValue {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe usarse dentro de <AlertProvider>');
  }
  return context;
}
