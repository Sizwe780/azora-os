import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface EvolutionChartProps {
  data: { generation: number; bestFitness: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-950/80 backdrop-blur-sm border border-purple-500/50 p-3 rounded-lg shadow-lg">
        <p className="text-sm text-purple-300">{`Generation: ${label}`}</p>
        <p className="text-lg font-bold text-white">{`Fitness: ${(payload[0].value * 100).toFixed(2)}%`}</p>
      </div>
    );
  }
  return null;
};

const EvolutionChart: React.FC<EvolutionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="colorFitness" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="generation" 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          stroke="#6b7280"
          tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}
          domain={['dataMin - 0.01', 'dataMax + 0.01']}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="bestFitness" 
          stroke="#a855f7" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorFitness)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default EvolutionChart;
