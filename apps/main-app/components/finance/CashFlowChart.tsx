import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FinanceData } from '../../features/finance/mockData';

interface CashFlowChartProps {
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
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
        <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} axisLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }} tickLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }} />
        <YAxis tickFormatter={formatCurrency} tick={{ fill: '#9CA3AF' }} axisLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }} tickLine={{ stroke: 'rgba(0, 255, 255, 0.2)' }} />
        <Tooltip 
          content={(props) => <CustomTooltip {...props} formatCurrency={formatCurrency} />}
          cursor={{ fill: 'rgba(167, 139, 250, 0.1)' }}
        />
        <defs>
          <linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.7}/>
            <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="cashflow" stroke="#A78BFA" strokeWidth={2} fillOpacity={1} fill="url(#colorCashflow)" name="Net Cash Flow" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CashFlowChart;
