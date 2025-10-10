import React from 'react';
import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueAllocation {
  category: string;
  percentage: number;
  amount: number;
  color: string;
  [key: string]: string | number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface RevenueData {
  mrr: number;
  arr: number;
  growthRate: number;
  allocations: RevenueAllocation[];
  trends: MonthlyRevenue[];
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await fetch('/api/hr-ai/revenue/status');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Failed to load revenue data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Revenue Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track MRR, ARR, growth, and allocation breakdown</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MRR */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90">Monthly Recurring Revenue</p>
          <p className="text-4xl font-bold mt-2">R{(data.mrr / 1000000).toFixed(1)}M</p>
        </div>

        {/* ARR */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90">Annual Recurring Revenue</p>
          <p className="text-4xl font-bold mt-2">R{(data.arr / 1000000).toFixed(1)}M</p>
        </div>

        {/* Growth Rate */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8" />
            <span className="text-sm opacity-90">vs Last Month</span>
          </div>
          <p className="text-sm opacity-90">Growth Rate</p>
          <p className="text-4xl font-bold mt-2">+{data.growthRate}%</p>
        </div>
      </div>

      {/* Allocation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
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
                label={({ category, percentage }) => `${category}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {data.allocations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Allocation Details</h2>
          <div className="space-y-4">
            {data.allocations.map((allocation, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: allocation.color }}></div>
                  <span className="font-medium text-gray-900 dark:text-white">{allocation.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">R{(allocation.amount / 1000000).toFixed(2)}M</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{allocation.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Revenue Trends (Last 12 Months)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`R${(value / 1000000).toFixed(2)}M`, 'Revenue']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
