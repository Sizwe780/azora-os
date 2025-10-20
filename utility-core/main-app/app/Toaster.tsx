import React from 'react';
import { useNotifications } from '../context/NotificationProvider';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimes, FaShieldAlt } from 'react-icons/fa';

const iconMap = {
  info: FaInfoCircle,
  success: FaCheckCircle,
  warning: FaExclamationTriangle,
  error: FaTimes,
  guardian: FaShieldAlt,
};

const colorMap = {
  info: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
  guardian: 'bg-purple-600',
};

export function Toaster() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notif) => {
        const Icon = iconMap[notif.type];
        const colorClass = colorMap[notif.type];
        
        return (
          <div
            key={notif.id}
            className={`${colorClass} text-white px-4 py-3 rounded-lg shadow-2xl backdrop-blur-xl flex items-center gap-3 min-w-[300px] animate-slide-in`}
          >
            <Icon className="text-xl" />
            <p className="flex-1 text-sm">{notif.message}</p>
            <button
              onClick={() => removeNotification(notif.id)}
              className="text-white/70 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
        );
      })}
    </div>
  );
}
