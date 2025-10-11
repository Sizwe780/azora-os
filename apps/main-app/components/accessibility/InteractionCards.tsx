import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Keyboard } from 'lucide-react';
import { VOICE_COMMANDS, KEYBOARD_SHORTCUTS } from '../../features/accessibility/mockAccessibility';

export const VoiceControlCard: React.FC = () => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 h-full flex flex-col">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Mic className="text-blue-400" /> Voice Control</h3>
    <div className="flex-grow flex flex-col items-center justify-center">
      <motion.button 
        className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Mic className="w-12 h-12 text-white" />
      </motion.button>
      <p className="text-center text-sm text-gray-400 mt-4">Click and say a command like:</p>
    </div>
    <div className="space-y-2 text-center mt-4">
      {VOICE_COMMANDS.slice(0, 2).map(cmd => (
        <p key={cmd} className="text-blue-300 font-mono text-sm p-1 bg-blue-900/30 rounded">"{cmd}"</p>
      ))}
    </div>
  </div>
);

export const KeyboardShortcutsCard: React.FC = () => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Keyboard className="text-green-400" /> Keyboard Shortcuts</h3>
    <div className="space-y-2">
      {KEYBOARD_SHORTCUTS.map(sc => (
        <div key={sc.keys} className="flex justify-between items-center text-sm">
          <span className="text-gray-300">{sc.action}</span>
          <kbd className="px-2 py-1 bg-gray-700 text-green-300 rounded font-mono border border-gray-600">{sc.keys}</kbd>
        </div>
      ))}
    </div>
  </div>
);
