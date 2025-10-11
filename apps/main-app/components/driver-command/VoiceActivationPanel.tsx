import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

interface VoiceActivationPanelProps {
  isListening: boolean;
  auraMessage: string;
  onActivate: () => void;
}

const VoiceActivationPanel = ({ isListening, auraMessage, onActivate }: VoiceActivationPanelProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.3 }}
    className="bg-gradient-to-br from-gray-900/80 to-purple-900/30 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 text-center shadow-lg shadow-purple-500/10"
  >
    <motion.button
      onClick={onActivate}
      disabled={isListening}
      className="mx-auto p-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 disabled:opacity-70 shadow-lg shadow-purple-500/20"
      animate={{ scale: isListening ? [1, 1.15, 1] : 1 }}
      transition={{ duration: 1.2, repeat: isListening ? Infinity : 0, ease: "easeInOut" }}
      whileHover={{ scale: isListening ? 1 : 1.05 }}
      whileTap={{ scale: isListening ? 1 : 0.95 }}
    >
      <Mic className="w-10 h-10 text-white" />
    </motion.button>
    <p className="mt-4 text-lg text-purple-200 h-6 font-medium tracking-wide">{auraMessage}</p>
  </motion.div>
);

export default VoiceActivationPanel;
