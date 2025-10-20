import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  color: 'purple' | 'cyan' | 'green';
  children?: React.ReactNode;
}

const colorClasses = {
  purple: {
    bg: 'bg-purple-900/30',
    text: 'text-purple-300',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/10',
    iconText: 'text-purple-400',
  },
  cyan: {
    bg: 'bg-cyan-900/30',
    text: 'text-cyan-300',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/10',
    iconText: 'text-cyan-400',
  },
  green: {
    bg: 'bg-green-900/30',
    text: 'text-green-300',
    border: 'border-green-500/20',
    iconBg: 'bg-green-500/10',
    iconText: 'text-green-400',
  },
};

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, value, subtitle, color, children }) => {
  const classes = colorClasses[color];
  return (
    <div className={`p-6 rounded-2xl ${classes.bg} border ${classes.border} h-full flex flex-col backdrop-blur-lg`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${classes.iconBg}`}>
          <Icon className={`w-7 h-7 ${classes.iconText}`} />
        </div>
        <div>
          <p className={`text-sm ${classes.text}`}>{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
      {subtitle && <p className="text-sm text-gray-400 mt-1 ml-1">{subtitle}</p>}
      <div className="flex-grow mt-4">
        {children}
      </div>
    </div>
  );
};

export default InfoCard;
