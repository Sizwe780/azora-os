import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FinanceData } from '../../features/finance/mockData';

interface RevenueChartProps {
  data: FinanceData['revenueVsExpenses'];
  formatCurrency: (amount: number) => string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any;
  label?: string | number;
  formatCurrency: (amount: number) => string;
}

const CustomTooltip = ({ active, payload, label = '', formatCurrency }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-950/90 backdrop-blur-lg border border-cyan-500/30 rounded-lg p-4 shadow-lg">
        <p className="label text-cyan-200 font-semibold">{String(label)}</p>
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
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
        <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} axisLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }} tickLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }} />
        <YAxis tickFormatter={formatCurrency} tick={{ fill: '#9CA3AF' }} axisLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }} tickLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }} />
        <Tooltip
          content={(props) => <CustomTooltip {...props} formatCurrency={formatCurrency} />}
          cursor={{ fill: 'rgba(0, 255, 255, 0.05)' }}
        />
        <Legend wrapperStyle={{ color: '#9CA3AF', paddingTop: '20px' }} />
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
          </linearGradient>
          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.3}/>
          </linearGradient>
        </defs>
        <Bar dataKey="revenue" fill="url(#colorRevenue)" name="Revenue" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="url(#colorExpenses)" name="Expenses" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
