import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SettingToggleProps {
  icon: LucideIcon;
  title: string;
  enabled: boolean;
  onToggle: () => void;
}

const SettingToggle: React.FC<SettingToggleProps> = ({ icon: Icon, title, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-cyan-300" />
      <span className="text-white font-medium">{title}</span>
    </div>
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-cyan-600' : 'bg-gray-700'}`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full`}
        style={{
          transform: enabled ? 'translateX(24px)' : 'translateX(0px)',
        }}
      />
    </button>
  </div>
);

export default SettingToggle;
