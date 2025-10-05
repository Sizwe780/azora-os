import React, { useState, useCallback, createContext } from 'react';
import NotificationToast from './molecules/NotificationToast';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((notification) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, ...notification }]);
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {notifications.map((n) => (
            <NotificationToast
              key={n.id}
              notification={n}
              onDismiss={dismiss}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
}
