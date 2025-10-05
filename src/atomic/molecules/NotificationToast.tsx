import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-cyan-400" />,
};

const NotificationToast = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300); // Wait for animation to finish
  };

  const animationClass = isExiting ? 'animate-toast-out' : 'animate-toast-in';

  return (
    <div
      className={`relative w-full max-w-sm p-4 rounded-lg shadow-lg overflow-hidden bg-slate-800/80 backdrop-blur-sm border border-white/10 ${animationClass}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {icons[notification.type] || icons.info}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-white/90">{notification.title}</p>
          <p className="mt-1 text-sm text-white/60">{notification.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleDismiss}
            className="inline-flex rounded-md text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
