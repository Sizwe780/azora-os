import React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'guardian';
  message: string;
  timestamp: number;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const id = `notif_${Date.now()}_${Math.random()}`;
    const notification: Notification = {
      id,
      type,
      message,
      timestamp: Date.now(),
    };
    setNotifications(prev => [...prev, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
