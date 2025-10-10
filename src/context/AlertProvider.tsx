import React from 'react';
import { createContext, useContext, useState } from 'react';

type Alert = { id: string; type: 'info' | 'warning' | 'error'; message: string };

const AlertContext = createContext<{
  alerts: Alert[];
  push: (a: Omit<Alert, 'id'>) => void;
  dismiss: (id: string) => void;
}>({ alerts: [], push: () => {}, dismiss: () => {} });

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  function push(a: Omit<Alert, 'id'>) {
    const id = Math.random().toString(36).slice(2);
    setAlerts(prev => [...prev, { ...a, id }]);
    setTimeout(() => dismiss(id), 8000); // auto-dismiss
  }

  function dismiss(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  return (
    <AlertContext.Provider value={{ alerts, push, dismiss }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertContext);
}
