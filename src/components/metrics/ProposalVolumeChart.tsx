import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMetrics } from '../../context/MetricsProvider';

export function ProposalVolumeChart() {
  const { metrics } = useMetrics();
  const data = Array.from({ length: 10 }).map((_, i) => ({
    time: `${i}m`,
    proposals: Math.max(metrics.proposals - i * 3, 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="proposals" stroke="#6366f1" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
