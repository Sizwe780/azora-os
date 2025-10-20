import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: 'cyan' | 'green' | 'purple' | 'yellow';
}

const colorClasses = {
  cyan: {
    bg: 'bg-cyan-900/30',
    text: 'text-cyan-300',
    iconBg: 'bg-cyan-500/10',
    iconText: 'text-cyan-300',
    border: 'border-cyan-500/20',
  },
  green: {
    bg: 'bg-green-900/30',
    text: 'text-green-300',
    iconBg: 'bg-green-500/10',
    iconText: 'text-green-300',
    border: 'border-green-500/20',
  },
  purple: {
    bg: 'bg-purple-900/30',
    text: 'text-purple-300',
    iconBg: 'bg-purple-500/10',
    iconText: 'text-purple-300',
    border: 'border-purple-500/20',
  },
  yellow: {
    bg: 'bg-yellow-900/30',
    text: 'text-yellow-300',
    iconBg: 'bg-yellow-500/10',
    iconText: 'text-yellow-300',
    border: 'border-yellow-500/20',
  },
};

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, color }) => {
  const classes = colorClasses[color];
  return (
    <div className={`p-5 rounded-2xl ${classes.bg} border ${classes.border} backdrop-blur-lg`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${classes.iconBg}`}>
          <Icon className={`w-6 h-6 ${classes.iconText}`} />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className={`text-3xl font-bold ${classes.text}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
