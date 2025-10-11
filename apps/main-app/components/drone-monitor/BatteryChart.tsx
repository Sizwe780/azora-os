import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DroneData } from '../../features/drone-monitor/mockData';

interface BatteryChartProps {
  drones: DroneData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 shadow-lg">
          <p className="label text-sm font-bold text-white">{`Drone: ${label}`}</p>
          <p className="intro text-cyan-400">{`Battery: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

const BatteryChart = ({ drones }: BatteryChartProps) => {
  const batteryData = drones.map(d => ({ name: d.id, battery: d.battery }));

  const getBarColor = (battery: number) => {
    if (battery < 15) return '#ef4444'; // red-500
    if (battery < 40) return '#f59e0b'; // amber-500
    return '#22d3ee'; // cyan-400
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full"
    >
      <h2 className="text-xl font-semibold text-white mb-4">Fleet Battery Levels</h2>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={batteryData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis unit="%" tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[0, 100]} />
            <Tooltip
              cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}
              content={<CustomTooltip />}
            />
            <Bar dataKey="battery" radius={[4, 4, 0, 0]}>
              {batteryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.battery)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default BatteryChart;
