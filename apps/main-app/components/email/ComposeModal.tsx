import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip } from 'lucide-react';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-gray-950 border border-white/10 rounded-xl shadow-2xl w-full max-w-3xl"
          >
            <header className="flex justify-between items-center p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">New Message</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5 text-gray-400"/>
              </button>
            </header>
            <div className="p-6 space-y-4">
              <input type="text" placeholder="To" className="w-full px-4 py-2.5 border border-gray-700/50 rounded-lg bg-gray-800/60 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-colors"/>
              <input type="text" placeholder="Subject" className="w-full px-4 py-2.5 border border-gray-700/50 rounded-lg bg-gray-800/60 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-colors"/>
              <textarea placeholder="Write your message..." rows={10} className="w-full px-4 py-2.5 border border-gray-700/50 rounded-lg bg-gray-800/60 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-colors font-sans"/>
            </div>
            <footer className="flex justify-between items-center p-4 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors"><Paperclip className="w-5 h-5 text-gray-400"/></button>
              </div>
              <button onClick={onClose} className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComposeModal;
