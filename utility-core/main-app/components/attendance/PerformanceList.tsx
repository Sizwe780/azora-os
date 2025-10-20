import React from 'react';
import { motion } from 'framer-motion';
import { GitCommit, GitPullRequest, CheckCircle, Rocket, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { EmployeePerformance } from '../../features/attendance/mockAttendanceData';

interface PerformanceListProps {
  title: string;
  performers: EmployeePerformance[];
  trend: 'up' | 'down';
}

const TREND_MAP = {
  up: {
    icon: TrendingUp,
    color: 'text-green-400',
    bg: 'bg-green-900/30',
    border: 'border-green-500/30',
    scoreColor: 'text-green-400',
  },
  down: {
    icon: TrendingDown,
    color: 'text-red-400',
    bg: 'bg-red-900/30',
    border: 'border-red-500/30',
    scoreColor: 'text-red-400',
  },
};

const PerformanceCard: React.FC<{ employee: EmployeePerformance; trend: 'up' | 'down'; index: number }> = ({ employee, trend, index }) => {
  const { scoreColor } = TREND_MAP[trend];
  
  const TrendIcon = employee.trend === 'up' ? TrendingUp : employee.trend === 'down' ? TrendingDown : Minus;
  const trendColor = employee.trend === 'up' ? 'text-green-500' : employee.trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, x: trend === 'up' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl"
    >
      <div className="flex items-center gap-4">
        <img src={employee.avatar} alt={employee.name} className="w-12 h-12 rounded-full" />
        <div>
          <p className="font-semibold text-white text-lg">{employee.name}</p>
          <p className="text-sm text-gray-400">{employee.role}</p>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-gray-300">
            <span className="flex items-center gap-1"><GitCommit className="w-3 h-3" /> {employee.metrics.commits}</span>
            <span className="flex items-center gap-1"><GitPullRequest className="w-3 h-3" /> {employee.metrics.prs}</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {employee.metrics.tasks}</span>
            <span className="flex items-center gap-1"><Rocket className="w-3 h-3" /> {employee.metrics.features}</span>
          </div>
        </div>
      </div>
      <div className="text-right flex items-center gap-4">
        <TrendIcon className={`w-6 h-6 ${trendColor}`} />
        <div>
            <p className={`text-3xl font-bold ${scoreColor}`}>{employee.score}</p>
            <p className="text-sm text-gray-500">Score</p>
        </div>
      </div>
    </motion.div>
  );
};

const PerformanceList: React.FC<PerformanceListProps> = ({ title, performers, trend }) => {
  const { icon: Icon, color, bg, border } = TREND_MAP[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`bg-gray-900/50 backdrop-blur-lg border ${border} rounded-2xl p-6`}
    >
      <h2 className={`text-xl font-bold ${color} mb-4 flex items-center gap-2`}>
        <Icon className="w-5 h-5" />
        <span>{title}</span>
      </h2>
      <div className="space-y-3">
        {performers.map((employee, index) => (
          <PerformanceCard key={employee.id} employee={employee} trend={trend} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default PerformanceList;
