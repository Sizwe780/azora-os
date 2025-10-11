import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-8 right-8 bg-gray-800 border border-green-500/30 rounded-lg shadow-lg px-6 py-4 flex items-center space-x-4 z-50"
        >
          <CheckCircle className="w-6 h-6 text-green-400"/>
          <p className="text-white">{message}</p>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700"><X className="w-4 h-4"/></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
