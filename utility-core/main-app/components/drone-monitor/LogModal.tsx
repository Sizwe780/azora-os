import { motion } from 'framer-motion';
import { X, FileText } from 'lucide-react';

interface LogModalProps {
  logContent: string;
  onClose: () => void;
}

const LogModal = ({ logContent, onClose }: LogModalProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900/70 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 w-full max-w-2xl p-6 relative"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-cyan-400" />
        <h3 className="text-lg font-mono font-semibold text-white">Drone Operations Log</h3>
      </div>
      <pre className="bg-black/50 p-4 rounded-md text-sm text-gray-300 whitespace-pre-wrap font-mono overflow-auto max-h-[60vh] border border-gray-700/50">
        {logContent}
      </pre>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/80 text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </motion.button>
    </motion.div>
  </motion.div>
);

export default LogModal;
