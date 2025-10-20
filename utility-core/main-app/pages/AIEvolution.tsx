import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, Globe, Shield, Cpu, Activity, Award, Flag, RefreshCw } from 'lucide-react';

import { AIEvolutionData, getMockAIEvolutionData } from '../features/ai-evolution/mockAIEvolution';
import EvolutionChart from '../components/ai-evolution/EvolutionChart';
import InfoCard from '../components/ai-evolution/InfoCard';
import MiniStat from '../components/ai-evolution/MiniStat';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AIEvolution() {
  const [data, setData] = useState<AIEvolutionData | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const fetchData = useCallback(() => {
    setData(getMockAIEvolutionData());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEvolve = async () => {
    setIsEvolving(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    // In a real app, you'd refetch or update state from an API response
    setData(prev => prev ? ({ ...prev, evolution: { ...prev.evolution, generation: prev.evolution.generation + 1, bestFitness: prev.evolution.bestFitness * 1.001 }}) : null);
    setIsEvolving(false);
  };

  const handleImprove = async () => {
    setIsImproving(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setData(prev => prev ? ({ ...prev, improvement: { ...prev.improvement, totalImprovements: prev.improvement.totalImprovements + 1, patchesApplied: prev.improvement.patchesApplied + 1 }}) : null);
    setIsImproving(false);
  };

  if (!data) {
    return <div className="flex items-center justify-center h-full"><Brain className="w-16 h-16 text-purple-400 animate-spin" /></div>;
  }

  const { evolution, improvement, regional } = data;

  return (
    <motion.div 
      className="p-6 bg-gray-950 text-white space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="relative">
          <Brain className="w-12 h-12 text-purple-400" />
          <Zap className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">AI Evolution Engine</h1>
          <p className="text-purple-300 flex items-center gap-2">
            Self-Improving • Self-Healing • South African Powered
            <Flag className="w-5 h-5 text-green-400" />
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <InfoCard icon={Cpu} title="Genetic Evolution" value={`Gen ${evolution.generation}`} color="purple">
          <div className="space-y-3 my-4">
            <MiniStat label="Best Fitness" value={`${(evolution.bestFitness * 100).toFixed(2)}%`} />
            <div className="w-full bg-purple-900/50 rounded-full h-2.5">
              <motion.div
                className="bg-purple-500 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${evolution.bestFitness * 100}%` }}
              />
            </div>
            <MiniStat label="Population" value={evolution.populationSize} />
            <MiniStat label="Mutation Rate" value={`${(evolution.mutationRate * 100).toFixed(0)}%`} />
          </div>
          <button onClick={handleEvolve} disabled={isEvolving} className="w-full mt-auto py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
            {isEvolving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Evolving...</> : <><TrendingUp className="w-4 h-4" /> Evolve Now</>}
          </button>
        </InfoCard>

        <InfoCard icon={Activity} title="Self-Improvement" value={improvement.totalImprovements} subtitle="Improvements" color="cyan">
          <div className="space-y-3 my-4">
            <MiniStat label="Metrics Analyzed" value={improvement.metricsAnalyzed.toLocaleString()} />
            <MiniStat label="Patches Applied" value={improvement.patchesApplied} />
            <MiniStat label="Status" value={improvement.isLearning ? 'Learning...' : 'Idle'} />
            <div className="pt-2 border-t border-cyan-500/20">
              <p className="text-xs text-cyan-300 mb-1">Latest Patch:</p>
              <p className="text-xs text-white">{improvement.latestPatch.description}</p>
            </div>
          </div>
          <button onClick={handleImprove} disabled={isImproving || improvement.isLearning} className="w-full mt-auto py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
            {isImproving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Improving...</> : <><Zap className="w-4 h-4" /> Improve Now</>}
          </button>
        </InfoCard>

        <InfoCard icon={Globe} title={regional.name} value={regional.status} color="green">
          <div className="space-y-3 my-4">
            {regional.compliance.map(c => (
              <div key={c.name} className="flex items-center gap-2">
                {c.name === 'B-BBEE' ? <Award className="w-4 h-4 text-yellow-400" /> : <Shield className="w-4 h-4 text-green-400" />}
                <span className="text-sm text-green-200">{c.name} Level {c.level}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto p-3 bg-green-900/50 rounded-lg">
            <p className="text-xs text-green-300 mb-2">Key Features:</p>
            <div className="flex flex-wrap gap-2">
              {regional.features.map(feat => (
                <span key={feat} className="px-2 py-1 bg-green-500/30 text-green-200 text-xs rounded">
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </InfoCard>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          Evolutionary Fitness History
        </h2>
        <EvolutionChart data={evolution.evolutionHistory} />
      </motion.div>
    </motion.div>
  );
}

