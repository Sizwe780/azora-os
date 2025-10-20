import React from 'react';
import { motion } from 'framer-motion';

interface SettingsSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  color: 'purple' | 'green' | 'yellow' | 'cyan' | 'blue' | 'pink';
}

const colorMap = {
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
};


const SettingsSection: React.FC<SettingsSectionProps> = ({ icon: Icon, title, description, children, color }) => {
  const classes = colorMap[color];
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-lg">
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-2.5 rounded-lg mt-1 ${classes.bg} border ${classes.border}`}>
          <Icon className={`w-6 h-6 ${classes.text}`} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <div className="space-y-5 pl-14">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;
