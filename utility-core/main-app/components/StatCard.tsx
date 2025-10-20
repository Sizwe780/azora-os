import React from 'react';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  metric?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, metric, color }) => (
  <div className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-4`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-${color}-500/20 rounded-lg`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
      <div>
        <p className={`text-sm text-${color}-300`}>{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
    {metric && <p className="text-xs text-gray-400 mt-1">{metric}</p>}
  </div>
);

export default StatCard;
