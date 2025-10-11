import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RevenueData, getMockRevenueData } from '../features/revenue/mockRevenue';
import StatCard from '../components/StatCard';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);

  useEffect(() => {
    setData(getMockRevenueData());
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-full"><Activity className="w-16 h-16 text-purple-400 animate-spin" /></div>;
  }

  return (
    <motion.div 
      className="p-6 bg-gray-950 text-white space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-4">
          <DollarSign className="w-10 h-10 text-green-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Revenue Command</h1>
            <p className="text-green-300">Real-time Financial Intelligence</p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        <StatCard icon={DollarSign} title="Monthly Recurring Revenue" value={`R${(data.mrr / 1000000).toFixed(1)}M`} color="blue" />
        <StatCard icon={TrendingUp} title="Annual Recurring Revenue" value={`R${(data.arr / 1000000).toFixed(1)}M`} color="green" />
        <StatCard icon={Activity} title="Growth Rate (MoM)" value={`+${data.growthRate}%`} color="purple" />
      </motion.div>

      {/* Charts */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        variants={itemVariants}
      >
        {/* Revenue Trends */}
        <div className="lg:col-span-3 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Revenue Trends (12-Mo)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trends} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="month" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} tickFormatter={(value) => `R${Number(value) / 1000000}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }}
                formatter={(value: number) => [`R${(value / 1000000).toFixed(2)}M`, 'Revenue']}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 8, stroke: '#1d4ed8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Breakdown */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            <span>Revenue Allocation</span>
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.allocations}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="percentage"
                nameKey="category"
                label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
              >
                {data.allocations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                formatter={(value, name) => [`${value}%`, name]}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}
