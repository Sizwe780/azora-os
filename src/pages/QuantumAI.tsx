import React from 'react';
import { useState, useEffect } from 'react';
import { Brain, Sparkles, Activity, Zap, TrendingUp, RefreshCw, Send, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuantumAI() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchHealth();
    const interval = setInterval(() => {
      fetchStats();
      fetchHealth();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:4050/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('http://localhost:4050/health/diagnosis');
      const data = await res.json();
      setHealth(data);
    } catch (error) {
      console.error('Health error:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:4050/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          maxLength: 50,
          temperature: 0.8,
          creativity: 0.7
        })
      });
      const data = await res.json();
      setResponse(data);
      setHistory(prev => [{ prompt, response: data, timestamp: Date.now() }, ...prev].slice(0, 10));
    } catch (error) {
      console.error('Generation error:', error);
    }
    setLoading(false);
  };

  const handleRating = async (input: string, output: string, rating: number) => {
    try {
      await fetch('http://localhost:4050/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, output, rating })
      });
      fetchStats(); // Refresh stats after learning
    } catch (error) {
      console.error('Learning error:', error);
    }
  };

  const handleHeal = async () => {
    try {
      await fetch('http://localhost:4050/heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quantum_recalibration' })
      });
      fetchHealth();
    } catch (error) {
      console.error('Healing error:', error);
    }
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
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-12 h-12 text-purple-300 opacity-50" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Quantum Deep Mind</h1>
            <p className="text-purple-300">100% Local AI • Zero External Dependencies • Self-Healing</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Stats Cards */}
        {stats && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-300">Neural Network</p>
                    <p className="text-2xl font-bold text-white">{stats.quantum_mind.total_neurons}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-purple-200">
                  <span>Architecture:</span>
                  <span className="font-mono">{stats.quantum_mind.architecture}</span>
                </div>
                <div className="flex justify-between text-purple-200">
                  <span>Layers:</span>
                  <span>{stats.quantum_mind.layers}</span>
                </div>
                <div className="flex justify-between text-purple-200">
                  <span>Training Iterations:</span>
                  <span>{stats.quantum_mind.training_iterations}</span>
                </div>
              </div>
            </motion.div>

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
                    <p className="text-sm text-cyan-300">Quantum Coherence</p>
                    <p className="text-2xl font-bold text-white">
                      {(stats.quantum_mind.quantum_coherence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-cyan-200">
                  <span>Learning Rate:</span>
                  <span>{stats.quantum_mind.learning_rate}</span>
                </div>
                <div className="w-full bg-cyan-900/30 rounded-full h-3">
                  <motion.div
                    className="h-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.quantum_mind.quantum_coherence * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-green-300">Memory</p>
                    <p className="text-2xl font-bold text-white">{stats.memory.long_term}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-green-200">
                  <span>Long-term:</span>
                  <span>{stats.memory.long_term}</span>
                </div>
                <div className="flex justify-between text-green-200">
                  <span>Short-term:</span>
                  <span>{stats.memory.short_term}</span>
                </div>
                <div className="flex justify-between text-green-200">
                  <span>Capacity:</span>
                  <span>{stats.memory.total_capacity}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Generator */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            AI Generator
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
                placeholder="Describe what you want the AI to help with..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Generate
                </>
              )}
            </button>

            {response && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-purple-500/30 rounded-xl p-4 space-y-3"
              >
                <div className="text-purple-200 leading-relaxed">
                  {response.response}
                </div>
                <div className="flex items-center gap-4 text-sm text-purple-300">
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Confidence: {(response.confidence * 100).toFixed(1)}%
                  </span>
                  <span>Tokens: {response.tokens_generated}</span>
                  <span>Creativity: {(response.creativity_score * 100).toFixed(0)}%</span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-purple-500/20">
                  <p className="text-sm text-purple-300">Rate this response:</p>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRating(prompt, response.response, rating)}
                      className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 rounded-lg transition-colors text-sm"
                    >
                      {rating}★
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Health Monitor */}
        <div className="space-y-6">
          {health && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-400" />
                  System Health
                </h2>
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  health.status === 'healthy' 
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {health.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-green-200">Quantum Coherence:</span>
                  <span className="text-white font-semibold">
                    {(health.health.quantum_coherence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-200">Memory Health:</span>
                  <span className="text-white font-semibold">
                    {(health.health.memory_health * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-200">Neuron Activation:</span>
                  <span className="text-white font-semibold">
                    {(health.health.neuron_activation * 100).toFixed(1)}%
                  </span>
                </div>

                {health.anomalies.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-sm text-yellow-200 mb-2">Recent Anomalies:</p>
                    {health.anomalies.map((anomaly: any, i: number) => (
                      <div key={i} className="text-xs text-yellow-300">
                        • {anomaly.type} ({anomaly.severity})
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleHeal}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Trigger Self-Healing
                </button>
              </div>
            </div>
          )}

          {/* History */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Recent Generations
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-purple-500/20 rounded-xl p-3"
                >
                  <p className="text-sm text-purple-300 mb-1 truncate">{item.prompt}</p>
                  <p className="text-xs text-purple-200/70 truncate">{item.response.response}</p>
                  <p className="text-xs text-purple-400 mt-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
