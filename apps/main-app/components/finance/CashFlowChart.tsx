import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FinanceData } from '../../features/finance/mockData';

interface CashFlowChartProps {
  data: FinanceData['revenueVsExpenses'];
  formatCurrency: (amount: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-lg p-4">
        <p className="label text-white font-semibold">{`${label}`}</p>
        <p className="text-purple-400">{`Net Cash Flow: ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data, formatCurrency }) => {
  const chartData = data.map(d => ({ ...d, cashflow: d.revenue - d.expenses }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
        <YAxis tickFormatter={(value) => formatCurrency(value, true)} tick={{ fill: '#9CA3AF' }} />
        <Tooltip 
          content={<CustomTooltip formatCurrency={formatCurrency} />}
          cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
        />
        <defs>
          <linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="cashflow" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorCashflow)" name="Net Cash Flow" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CashFlowChart;
