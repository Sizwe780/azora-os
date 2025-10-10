import React from 'react';
import { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Globe, Shield, Cpu, Activity, Award, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIEvolution() {
  const [evolutionStats, setEvolutionStats] = useState<any>(null);
  const [improvementStats, setImprovementStats] = useState<any>(null);
  const [saInfo, setSaInfo] = useState<any>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [evolution, improvement, sa] = await Promise.all([
        fetch('http://localhost:4060/evolution/stats').then(r => r.json()),
        fetch('http://localhost:4060/improvement/stats').then(r => r.json()),
        fetch('http://localhost:4060/sa/info').then(r => r.json())
      ]);
      setEvolutionStats(evolution);
      setImprovementStats(improvement);
      setSaInfo(sa);
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const handleEvolve = async () => {
    setIsEvolving(true);
    try {
      await fetch('http://localhost:4060/evolution/evolve', { method: 'POST' });
      await fetchStats();
    } catch (error) {
      console.error('Evolution error:', error);
    }
    setIsEvolving(false);
  };

  const handleImprove = async () => {
    setIsImproving(true);
    try {
      await fetch('http://localhost:4060/improvement/run', { method: 'POST' });
      await fetchStats();
    } catch (error) {
      console.error('Improvement error:', error);
    }
    setIsImproving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="relative">
            <Brain className="w-12 h-12 text-purple-400" />
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-12 h-12 text-yellow-300 opacity-50" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">AI Evolution Engine</h1>
            <p className="text-purple-300 flex items-center gap-2">
              Self-Improving • Self-Healing • South African Powered 
              <Flag className="w-5 h-5 text-green-400" />
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Evolution Stats */}
        {evolutionStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Cpu className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-300">Genetic Evolution</p>
                  <p className="text-2xl font-bold text-white">Gen {evolutionStats.generation}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-purple-200">Best Fitness:</span>
                <span className="text-white font-semibold">
                  {(evolutionStats.bestFitness * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-purple-900/30 rounded-full h-3">
                <motion.div
                  className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${evolutionStats.bestFitness * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="flex justify-between text-sm text-purple-200">
                <span>Population:</span>
                <span>{evolutionStats.populationSize}</span>
              </div>
              <div className="flex justify-between text-sm text-purple-200">
                <span>Mutation Rate:</span>
                <span>{(evolutionStats.mutationRate * 100).toFixed(0)}%</span>
              </div>
            </div>
            <button
              onClick={handleEvolve}
              disabled={isEvolving}
              className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isEvolving ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  Evolving...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Evolve Now
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Self-Improvement Stats */}
        {improvementStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-cyan-300">Self-Improvement</p>
                  <p className="text-2xl font-bold text-white">{improvementStats.totalImprovements}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-cyan-200">Metrics Collected:</span>
                <span className="text-white font-semibold">{improvementStats.totalMetrics}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cyan-200">Patches Applied:</span>
                <span className="text-white font-semibold">{improvementStats.totalPatches}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cyan-200">Status:</span>
                <span className={`font-semibold ${improvementStats.isLearning ? 'text-yellow-400' : 'text-green-400'}`}>
                  {improvementStats.isLearning ? 'Learning...' : 'Ready'}
                </span>
              </div>
              {improvementStats.recentPatches.length > 0 && (
                <div className="mt-3 p-2 bg-cyan-500/10 rounded-lg">
                  <p className="text-xs text-cyan-300 mb-1">Latest Patch:</p>
                  <p className="text-xs text-white">
                    {improvementStats.recentPatches[improvementStats.recentPatches.length - 1].type}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleImprove}
              disabled={isImproving || improvementStats.isLearning}
              className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isImproving ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Improve Now
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* South African Market */}
        {saInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Globe className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-green-300">South Africa 🇿🇦</p>
                  <p className="text-2xl font-bold text-white">Integrated</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-green-200">Languages:</span>
                <span className="text-white font-semibold">{saInfo.supportedLanguages.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-200">Provinces:</span>
                <span className="text-white font-semibold">{saInfo.provinces.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-200">Payment Methods:</span>
                <span className="text-white font-semibold">{saInfo.paymentMethods}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-200">POPIA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-green-200">B-BBEE Level {saInfo.compliance.bbbee}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-500/10 rounded-xl">
              <p className="text-xs text-green-300 mb-2">Supported Payments:</p>
              <div className="flex flex-wrap gap-2">
                {['SnapScan', 'Zapper', 'Yoco', 'Ozow'].map(method => (
                  <span key={method} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Evolution History Chart */}
      {evolutionStats && evolutionStats.evolutionHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            Evolution Progress
          </h2>
          <div className="h-64 flex items-end gap-2">
            {evolutionStats.evolutionHistory.map((gen: any, idx: number) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg relative group"
                style={{ height: `${gen.bestFitness * 100}%` }}
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Gen {gen.generation}: {(gen.bestFitness * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-purple-300">
            <span>Generation History (last 20)</span>
            <span>Current: Gen {evolutionStats.generation}</span>
          </div>
        </motion.div>
      )}

      {/* Population Overview */}
      {evolutionStats && evolutionStats.currentPopulation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-cyan-400" />
            Neural Architecture Population
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {evolutionStats.currentPopulation.slice(0, 10).map((arch: any, idx: number) => (
              <motion.div
                key={arch.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-xl border ${
                  idx === 0 
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/40'
                    : 'bg-white/5 border-cyan-500/20'
                }`}
              >
                {idx === 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-bold">BEST</span>
                  </div>
                )}
                <div className="text-xs text-gray-400 mb-2">Architecture #{idx + 1}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-cyan-300">Fitness:</span>
                    <span className="text-white font-bold">{(arch.fitness * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Layers:</span>
                    <span>{arch.layers}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Age:</span>
                    <span>{arch.age} gen</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Mutations:</span>
                    <span>{arch.mutations}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
