import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Users } from 'lucide-react';

interface AttendanceHeaderProps {
  teamAverage: number;
}

const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({ teamAverage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <Users className="w-8 h-8 text-purple-400" />
        </div>
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Deliverable-Based Attendance</h1>
            <p className="text-purple-300/80 mt-1 text-sm md:text-base">Track performance by commits, PRs, tasks, and features delivered.</p>
        </div>
      </div>
      <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-4 text-center w-full md:w-auto flex items-center gap-4">
        <div className="p-2 bg-purple-500/10 rounded-lg">
            <BarChart className="w-6 h-6 text-purple-400" />
        </div>
        <div>
            <p className="text-sm text-purple-300 font-medium text-left">Team Velocity</p>
            <p className="text-4xl font-bold text-purple-400">{teamAverage.toFixed(1)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceHeader;
