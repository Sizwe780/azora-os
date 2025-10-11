import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FinanceData } from '../../features/finance/mockData';

interface RevenueChartProps {
  data: FinanceData['revenueVsExpenses'];
  formatCurrency: (amount: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        <p className="label text-white font-semibold">{`${label}`}</p>
        <p className="text-blue-400">{`Revenue: ${formatCurrency(payload[0].value)}`}</p>
        <p className="text-red-400">{`Expenses: ${formatCurrency(payload[1].value)}`}</p>
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data, formatCurrency }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
        <YAxis tickFormatter={(value) => formatCurrency(value, true)} tick={{ fill: '#9CA3AF' }} />
        <Tooltip
          content={<CustomTooltip formatCurrency={formatCurrency} />}
          cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
        />
        <Legend wrapperStyle={{ color: '#9CA3AF' }} />
        <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#EF4444" name="Expenses" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
