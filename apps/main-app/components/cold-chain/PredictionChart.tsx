import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { TemperaturePredictionPoint } from '../../features/cold-chain/mockColdChainData';

interface PredictionChartProps {
  predictions: TemperaturePredictionPoint[];
  assetName: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg p-3 text-sm">
          <p className="label text-white">{`Hour: ${label}`}</p>
          <p className="intro text-blue-400">{`Temp: ${payload[0].value.toFixed(2)}°C`}</p>
          <p className={`risk text-${payload[0].payload.riskLevel === 'HIGH' ? 'red' : 'yellow'}-400`}>
            {`Risk: ${payload[0].payload.riskLevel}`}
          </p>
        </div>
      );
    }
    return null;
};

const PredictionChart: React.FC<PredictionChartProps> = ({ predictions, assetName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-1">72-Hour Quantum Prediction</h3>
      <p className="text-sm text-gray-400 mb-4">{assetName}</p>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={predictions}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
             <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F87171" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF" 
            tick={{ fontSize: 12 }} 
            label={{ value: 'Hours from now', position: 'insideBottom', offset: -5, fill: '#9CA3AF', fontSize: 12 }} 
          />
          <YAxis 
            stroke="#9CA3AF" 
            tick={{ fontSize: 12 }} 
            domain={['dataMin - 1', 'dataMax + 1']} 
            tickFormatter={(value) => `${value.toFixed(1)}°C`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="temperature" 
            stroke="#3B82F6" 
            fill="url(#colorTemp)" 
            strokeWidth={2} 
            name="Temperature"
          />
          {predictions.some(p => p.riskLevel === 'HIGH') && 
            <ReferenceLine 
                y={predictions.find(p => p.riskLevel === 'HIGH')?.temperature} 
                label={{ value: "High Risk Threshold", fill: '#F87171', fontSize: 12, position: 'insideTopLeft' }}
                stroke="#F87171" 
                strokeDasharray="4 4" 
            />
          }
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default PredictionChart;
