import { useState, useEffect } from 'react';
import { Snowflake, Thermometer, Bolt, Shield, AlertTriangle, LineChart, Coins, Link } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const StatCard = ({ icon: Icon, title, value, color, metric }) => (
  <div className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm text-${color}-300`}>{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
    </div>
    {metric && <p className="text-xs text-gray-400 mt-1">{metric}</p>}
  </div>
);

const mockAssets = [
  { id: 'AZ-CC-001', name: 'Vaccine Shipment A', type: 'Pharma', currentTemp: 2.1, location: 'CPT Warehouse', status: 'Optimal' },
  { id: 'AZ-CC-002', name: 'Fresh Produce B', type: 'Food', currentTemp: 4.5, location: 'En route to JHB', status: 'Optimal' },
  { id: 'AZ-CC-003', name: 'Lab Samples C', type: 'Medical', currentTemp: -18.2, location: 'Stellenbosch Uni', status: 'Warning' },
];

const mockPredictions = Array.from({ length: 48 }, (_, i) => ({
  time: i,
  temperature: 2.1 + Math.sin(i / 8) * 0.5 + (Math.random() - 0.5) * 0.2,
  riskLevel: i > 40 ? 'HIGH' : 'LOW',
}));

const mockInterventions = [
  { id: 'INT-001', assetId: 'AZ-CC-003', severity: 'CRITICAL', timeUntilFailure: 1.5, actions: [{ action: 'Compressor Boost', status: 'Completed' }], financialImpact: { savedAmount: 150000 } },
  { id: 'INT-002', assetId: 'AZ-CC-001', severity: 'MEDIUM', timeUntilFailure: 12, actions: [{ action: 'Route Optimization', status: 'Completed' }], financialImpact: { savedAmount: 25000 } },
];

const mockEnergyData = {
  dailySavings: 120.50,
  savingsPercent: 42.5,
  projectedAnnualSavings: 43982.50,
  schedule: Array.from({ length: 24 }, (_, i) => ({ hour: i, compressorSpeed: 50 + Math.sin(i / 4) * 30 })),
};

export default function ColdChainCommand() {
  const [selectedAsset, setSelectedAsset] = useState(mockAssets[0]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <Snowflake className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Cold Chain Quantum Engine</h1>
            <p className="text-blue-300">Zero-Loss Guarantee • Molecular Precision • Autonomous Protection</p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard icon={Snowflake} title="Active Assets" value={mockAssets.length} color="blue" />
        <StatCard icon={Bolt} title="Energy Savings" value={`${mockEnergyData.savingsPercent.toFixed(1)}%`} color="green" />
        <StatCard icon={AlertTriangle} title="Interventions" value={mockInterventions.length} color="purple" />
        <StatCard icon={Coins} title="Value Saved" value={`$${(mockInterventions.reduce((sum, i) => sum + i.financialImpact.savedAmount, 0) / 1000).toFixed(0)}k`} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assets & Predictions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Selector */}
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Asset Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${selectedAsset.id === asset.id ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'}`}
                >
                  <p className="font-semibold text-white">{asset.name}</p>
                  <p className={`text-2xl font-bold ${asset.status === 'Warning' ? 'text-yellow-400' : 'text-blue-400'}`}>{asset.currentTemp.toFixed(1)}°C</p>
                  <p className="text-xs text-gray-400">{asset.location}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Prediction Chart */}
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">72-Hour Quantum Prediction</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockPredictions}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 12 }} label={{ value: 'Hours from now', position: 'insideBottom', offset: -5, fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="temperature" stroke="#3B82F6" fill="url(#colorTemp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Interventions & Integrity */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Autonomous Interventions</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {mockInterventions.map((item) => (
                <div key={item.id} className={`p-3 rounded-lg border-l-4 ${item.severity === 'CRITICAL' ? 'border-red-500 bg-red-900/20' : 'border-yellow-500 bg-yellow-900/20'}`}>
                  <p className="font-bold text-white">{item.assetId}</p>
                  <p className="text-sm text-gray-300">{item.actions[0].action}</p>
                  <p className="text-xs text-gray-400">Predicted failure in {item.timeUntilFailure}h</p>
                  <p className="mt-1 text-sm font-bold text-green-400">Saved: ${item.financialImpact.savedAmount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Link className="w-5 h-5 text-purple-400" />Blockchain Integrity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Chain Status</span><span className="font-bold text-green-400">VERIFIED</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Blocks</span><span className="font-bold text-white">1,247</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Integrity</span><span className="font-bold text-green-400">100%</span></div>
            </div>
            <button className="w-full mt-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform">
              View Full Chain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
