import React from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Activity, ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  color: string;
  index: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, change, changeType, color, index }) => {
  const ChangeIcon = changeType === 'increase' ? ArrowUp : ArrowDown;
  const changeColor = changeType === 'increase' ? 'text-green-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium text-gray-400">{label}</h3>
        <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-4xl font-bold text-white mb-1">{value}</p>
        <div className="flex items-center text-sm">
          <ChangeIcon className={`w-4 h-4 mr-1 ${changeColor}`} />
          <span className={`${changeColor} font-semibold`}>{change}</span>
          <span className="text-gray-500 ml-1">vs last week</span>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC<{ usersCount: number; emailsCount: number }> = ({ usersCount, emailsCount }) => {
    const metrics = [
        {
            icon: Users,
            label: 'Total Users',
            value: usersCount.toString(),
            change: '+2.5%',
            changeType: 'increase',
            color: '#3b82f6', // blue-500
        },
        {
            icon: Mail,
            label: 'Emails Processed',
            value: emailsCount.toString(),
            change: '+12%',
            changeType: 'increase',
            color: '#22c55e', // green-500
        },
        {
            icon: Activity,
            label: 'Active Sessions',
            value: '12',
            change: '-3.1%',
            changeType: 'decrease',
            color: '#a855f7', // purple-500
        },
    ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric, i) => (
        <MetricCard
          key={metric.label}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          change={metric.change}
          changeType={metric.changeType as 'increase' | 'decrease'}
          color={metric.color}
          index={i}
        />
      ))}
    </div>
  );
};

export default Dashboard;
