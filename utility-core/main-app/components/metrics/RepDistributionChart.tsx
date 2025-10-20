import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMetrics } from '../../context/MetricsProvider';

export function RepDistributionChart() {
  const { metrics } = useMetrics();
  const data = Object.entries(metrics.repDistribution).map(([user, rep]) => ({ user, rep }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="user" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="rep" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}
