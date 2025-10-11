import { useState, useEffect, useCallback } from 'react';
import { Brain, Zap, TrendingUp, Globe, Shield, Cpu, Activity, Award, Flag, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

// ... (interfaces remain the same)

const StatCard = ({ icon: Icon, title, value, metric, color, children }) => (
  <div className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-6 h-full flex flex-col`}>
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <div>
        <p className={`text-sm text-${color}-300`}>{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
    {metric && <p className="text-sm text-gray-400 mb-4">{metric}</p>}
    <div className="flex-grow">{children}</div>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">{label}:</span>
    <span className="font-semibold text-white">{value}</span>
  </div>
);

export default function AIEvolution() {
  const [evolutionStats, setEvolutionStats] = useState(null);
  const [improvementStats, setImprovementStats] = useState(null);
  const [saInfo, setSaInfo] = useState(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const mockEvolutionStats = {
    generation: 1337,
    bestFitness: 0.9812,
    populationSize: 500,
    mutationRate: 0.05,
    evolutionHistory: Array.from({ length: 20 }, (_, i) => ({ generation: 1318 + i, bestFitness: 0.85 + i * 0.0065 })),
    currentPopulation: Array.from({ length: 5 }, (_, i) => ({ id: `arch-${i}`, fitness: 0.98 - i * 0.02, layers: 128 + i * 8, age: 10 - i, mutations: 5 + i * 2 })),
  };

  const mockImprovementStats = {
    totalImprovements: 542,
    totalMetrics: 1_200_523,
    totalPatches: 128,
    isLearning: false,
    recentPatches: [{ type: 'Optimized routing algorithm for dense urban areas.' }],
  };

  const mockSaInfo = {
    supportedLanguages: ['English', 'isiZulu', 'isiXhosa', 'Afrikaans', 'Sepedi'],
    provinces: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'],
    paymentMethods: 'Integrated',
    compliance: { bbbeee: 1 },
  };

  const fetchStats = useCallback(async () => {
    // Simulating API calls
    await new Promise(resolve => setTimeout(resolve, 500));
    setEvolutionStats(mockEvolutionStats);
    setImprovementStats(mockImprovementStats);
    setSaInfo(mockSaInfo);
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleEvolve = async () => {
    setIsEvolving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Here you would typically refetch or update state
    setIsEvolving(false);
  };

  const handleImprove = async () => {
    setIsImproving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Here you would typically refetch or update state
    setIsImproving(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Brain className="w-10 h-10 text-purple-400" />
            <Zap className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Evolution Engine</h1>
            <p className="text-purple-300 flex items-center gap-2">
              Self-Improving • Self-Healing • South African Powered
              <Flag className="w-5 h-5 text-green-400" />
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {evolutionStats && (
          <StatCard icon={Cpu} title="Genetic Evolution" value={`Gen ${evolutionStats.generation}`} color="purple">
            <div className="space-y-3 my-4">
              <MiniStat label="Best Fitness" value={`${(evolutionStats.bestFitness * 100).toFixed(2)}%`} />
              <div className="w-full bg-purple-900/50 rounded-full h-2.5">
                <motion.div
                  className="bg-purple-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${evolutionStats.bestFitness * 100}%` }}
                />
              </div>
              <MiniStat label="Population" value={evolutionStats.populationSize} />
              <MiniStat label="Mutation Rate" value={`${(evolutionStats.mutationRate * 100).toFixed(0)}%`} />
            </div>
            <button onClick={handleEvolve} disabled={isEvolving} className="w-full mt-auto py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
              {isEvolving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Evolving...</> : <><TrendingUp className="w-4 h-4" /> Evolve Now</>}
            </button>
          </StatCard>
        )}

        {improvementStats && (
          <StatCard icon={Activity} title="Self-Improvement" value={improvementStats.totalImprovements} metric="Improvements" color="cyan">
            <div className="space-y-3 my-4">
              <MiniStat label="Metrics Collected" value={improvementStats.totalMetrics.toLocaleString()} />
              <MiniStat label="Patches Applied" value={improvementStats.totalPatches} />
              <MiniStat label="Status" value={improvementStats.isLearning ? 'Learning...' : 'Idle'} />
              {improvementStats.recentPatches.length > 0 && (
                <div className="pt-2 border-t border-cyan-500/20">
                  <p className="text-xs text-cyan-300 mb-1">Latest Patch:</p>
                  <p className="text-xs text-white">{improvementStats.recentPatches[0].type}</p>
                </div>
              )}
            </div>
            <button onClick={handleImprove} disabled={isImproving || improvementStats.isLearning} className="w-full mt-auto py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
              {isImproving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Improving...</> : <><Zap className="w-4 h-4" /> Improve Now</>}
            </button>
          </StatCard>
        )}

        {saInfo && (
          <StatCard icon={Globe} title="South Africa 🇿🇦" value="Integrated" color="green">
            <div className="space-y-3 my-4">
              <MiniStat label="Languages" value={saInfo.supportedLanguages.length} />
              <MiniStat label="Provinces Covered" value={saInfo.provinces.length} />
              <MiniStat label="Payment Methods" value={saInfo.paymentMethods} />
              <div className="flex items-center gap-2 pt-2 border-t border-green-500/20">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-200">POPIA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-green-200">B-BBEE Level {saInfo.compliance.bbbeee}</span>
              </div>
            </div>
            <div className="mt-auto p-3 bg-green-900/50 rounded-lg">
              <p className="text-xs text-green-300 mb-2">Key Payment Gateways:</p>
              <div className="flex flex-wrap gap-2">
                {['SnapScan', 'Zapper', 'Yoco', 'Ozow'].map(method => (
                  <span key={method} className="px-2 py-1 bg-green-500/30 text-green-200 text-xs rounded">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </StatCard>
        )}
      </div>

      {/* Evolution History Chart */}
      {evolutionStats && evolutionStats.evolutionHistory.length > 0 && (
        <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            Evolution Progress
          </h2>
          <div className="h-40 flex items-end gap-1">
            {evolutionStats.evolutionHistory.map((gen, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-purple-600 to-indigo-600 rounded-t-md relative group"
                style={{ height: `${(gen.bestFitness - 0.8) * 500}%` }}
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-950 text-white text-xs px-2 py-1 rounded shadow-lg">
                  Gen {gen.generation}: {(gen.bestFitness * 100).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
