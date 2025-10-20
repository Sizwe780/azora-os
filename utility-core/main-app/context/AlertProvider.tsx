import React, { useCallback } from 'react';
import { createContext, useContext, useState } from 'react';

type Alert = { id: string; type: 'info' | 'warning' | 'error'; message: string };

const AlertContext = createContext<{
  alerts: Alert[];
  push: (a: Omit<Alert, 'id'>) => void;
  dismiss: (id: string) => void;
}>({ alerts: [], push: () => {}, dismiss: () => {} });

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const generateId = useCallback(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }, []);

  const dismiss = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const push = useCallback((alert: Omit<Alert, 'id'>) => {
    const id = generateId();
    setAlerts(prev => [...prev, { ...alert, id }]);
    window.setTimeout(() => dismiss(id), 8000);
  }, [dismiss, generateId]);

  return (
    <AlertContext.Provider value={{ alerts, push, dismiss }}>
      {children}
    </AlertContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAlerts() {
  return useContext(AlertContext);
}
