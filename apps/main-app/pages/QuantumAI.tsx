import React, { useCallback, useEffect, useState } from 'react';
import { Brain, Sparkles, Activity, Zap, TrendingUp, RefreshCw, Send, Award, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';

// ... (interfaces remain the same)

const StatCard = ({ icon: Icon, title, value, metric, color, children }) => (
  <div className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-6`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <div>
          <p className={`text-sm text-${color}-300`}>{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      {metric && <span className="text-sm font-semibold text-white">{metric}</span>}
    </div>
    {children}
  </div>
);

export default function QuantumAI() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<GenerationResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Mock data for demonstration purposes
  const mockStats: StatsResponse = {
    quantum_mind: { total_neurons: 1000000000, architecture: 'Quantum Transformer', layers: 128, training_iterations: 1500000, quantum_coherence: 0.98, learning_rate: 0.0001 },
    memory: { long_term: 5000000, short_term: 10000, total_capacity: 10000000 }
  };

  const mockHealth: HealthResponse = {
    status: 'healthy',
    health: { quantum_coherence: 0.98, memory_health: 0.99, neuron_activation: 0.95 },
    anomalies: []
  };

  const getStats = useCallback(async (): Promise<StatsResponse | null> => {
    // Simulating API call
    return new Promise(resolve => setTimeout(() => resolve(mockStats), 500));
  }, []);

  const getHealth = useCallback(async (): Promise<HealthResponse | null> => {
    // Simulating API call
    return new Promise(resolve => setTimeout(() => resolve(mockHealth), 500));
  }, []);

  const refreshStats = useCallback(async () => {
    const latest = await getStats();
    if (latest) setStats(latest);
  }, [getStats]);

  const refreshHealth = useCallback(async () => {
    const latest = await getHealth();
    if (latest) setHealth(latest);
  }, [getHealth]);

  useEffect(() => {
    refreshStats();
    refreshHealth();
    const interval = setInterval(() => {
      refreshStats();
      refreshHealth();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshHealth, refreshStats]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockResponse: GenerationResponse = {
      response: `Based on your prompt "${prompt}", the Quantum Deep Mind suggests a multi-faceted approach focusing on decentralized logistics and predictive analytics to optimize supply chains in emerging markets. This involves leveraging real-time data streams to create a self-correcting operational framework.`,
      confidence: 0.95,
      tokens_generated: 78,
      creativity_score: 0.88
    };
    setResponse(mockResponse);
    setHistory(prev => [{ prompt, response: mockResponse, timestamp: Date.now() }, ...prev].slice(0, 5));
    setLoading(false);
  };

  const handleRating = async (rating: 'good' | 'bad') => {
    console.log(`Rated as ${rating}`);
    // Here you would send the rating to the backend
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <Brain className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Quantum Deep Mind</h1>
            <p className="text-purple-300">Your personal AI for strategic insights and complex problem-solving.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stats && (
          <>
            <StatCard icon={Brain} title="Neural Network" value={`${(stats.quantum_mind.total_neurons / 1e9).toFixed(1)}B`} metric="Neurons" color="purple">
              <div className="text-xs text-gray-400 space-y-1 mt-2">
                <p>Arch: {stats.quantum_mind.architecture}</p>
                <p>Iterations: {(stats.quantum_mind.training_iterations / 1e6).toFixed(1)}M</p>
              </div>
            </StatCard>
            <StatCard icon={Activity} title="Q-Coherence" value={`${(stats.quantum_mind.quantum_coherence * 100).toFixed(1)}%`} color="cyan">
              <div className="w-full bg-cyan-900/50 rounded-full h-2.5 mt-3">
                <motion.div
                  className="bg-cyan-400 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.quantum_mind.quantum_coherence * 100}%` }}
                />
              </div>
            </StatCard>
            <StatCard icon={TrendingUp} title="LTM Storage" value={`${(stats.memory.long_term / 1e6).toFixed(1)}M`} metric="Vectors" color="green" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* AI Generator */}
        <div className="lg:col-span-3 bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            AI Generator
          </h2>
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
              placeholder="Ask a complex question or describe a scenario..."
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><RefreshCw className="w-5 h-5 animate-spin" />Thinking...</> : <><Send className="w-5 h-5" />Generate Insight</>}
            </button>
            {response && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
                <p className="text-gray-300 leading-relaxed">{response.response}</p>
                <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-gray-700">
                  <div className="flex gap-4">
                    <span>Conf: {(response.confidence * 100).toFixed(0)}%</span>
                    <span>Creativity: {(response.creativity_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRating('good')} className="p-1.5 rounded-full hover:bg-green-500/20 text-green-400"><ThumbsUp size={16} /></button>
                    <button onClick={() => handleRating('bad')} className="p-1.5 rounded-full hover:bg-red-500/20 text-red-400"><ThumbsDown size={16} /></button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-2 space-y-6">
          {health && (
            <div className="bg-gray-900/50 border border-green-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                System Health
              </h2>
              <div className="space-y-3 text-sm">
                <p className="flex justify-between"><span>Q-Coherence:</span> <span className="font-semibold">{(health.health.quantum_coherence * 100).toFixed(1)}%</span></p>
                <p className="flex justify-between"><span>Memory Integrity:</span> <span className="font-semibold">{(health.health.memory_health * 100).toFixed(1)}%</span></p>
                <p className="flex justify-between"><span>Neuron Activation:</span> <span className="font-semibold">{(health.health.neuron_activation * 100).toFixed(1)}%</span></p>
              </div>
              <button className="w-full mt-4 py-2 bg-green-500/10 text-green-300 rounded-lg text-sm hover:bg-green-500/20 transition-colors">
                Run Diagnostics
              </button>
            </div>
          )}
          <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              History
            </h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.length > 0 ? history.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-sm text-gray-300 truncate">{item.prompt}</p>
                  <p className="text-xs text-gray-500 truncate">{item.response.response}</p>
                </motion.div>
              )) : <p className="text-sm text-gray-500">No generation history yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
