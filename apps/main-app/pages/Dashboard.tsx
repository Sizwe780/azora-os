import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Brain, Zap, Activity, TrendingUp, Shield, Users } from 'lucide-react';
import { FaTruck, FaChartLine, FaRobot } from 'react-icons/fa';

export default function Dashboard({ userId = 'demo_user' }: { userId?: string }) {
  const stats = [
    { icon: Activity, label: 'Active Services', value: '12', change: '+8%', color: 'cyan' },
    { icon: TrendingUp, label: 'Revenue', value: 'R0', change: 'Pending', color: 'green' },
    { icon: FaTruck, label: 'Active Drivers', value: '0', change: 'Demo', color: 'blue' },
    { icon: Shield, label: 'Security', value: '100%', change: 'Optimal', color: 'purple' },
  ];

  const services = [
    { name: 'Quantum AI', desc: 'Advanced AI reasoning', icon: Brain, path: '/ai', status: 'active' },
    { name: 'AI Evolution', desc: 'Self-improving AI', icon: Zap, path: '/evolution', status: 'active' },
    { name: 'Fleet Tracking', desc: 'Real-time GPS tracking', icon: Activity, path: '/tracking', status: 'active' },
    { name: 'Driver Command', desc: 'Driver management', icon: FaTruck, path: '/driver', status: 'active' },
    { name: 'Cold Chain', desc: 'Temperature monitoring', icon: Shield, path: '/coldchain', status: 'ready' },
    { name: 'Safety Monitor', desc: 'Universal safety AI', icon: Shield, path: '/safety', status: 'ready' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-8"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 p-8">
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome Back, Sizwe
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-2xl">
              Your AI-powered command center is ready. All systems operational.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colors = {
            cyan: 'from-cyan-500 to-blue-500',
            green: 'from-green-500 to-emerald-500',
            blue: 'from-blue-500 to-indigo-500',
            purple: 'from-purple-500 to-pink-500',
          };
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard className="p-5 hover:scale-105 transition-transform duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[stat.color as keyof typeof colors]} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-green-400">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-white/60">{stat.label}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <FaRobot className="text-cyan-400" />
          Your AI Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.a
                key={service.name}
                href={service.path}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="block group"
              >
                <GlassCard className="p-6 hover:border-cyan-500/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-cyan-500/20 group-hover:scale-105">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      service.status === 'active' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {service.status === 'active' ? '● Live' : 'Ready'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-white/60">{service.desc}</p>
                </GlassCard>
              </motion.a>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="/ai" className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/50 transition-all text-center">
            <p className="text-sm font-semibold text-white">Ask Quantum AI</p>
          </a>
          <a href="/tracking" className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400/50 transition-all text-center">
            <p className="text-sm font-semibold text-white">View Fleet</p>
          </a>
          <a href="/evolution" className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-yellow-500/20 border border-green-500/30 hover:border-green-400/50 transition-all text-center">
            <p className="text-sm font-semibold text-white">AI Evolution 🇿🇦</p>
          </a>
          <a href="/settings" className="px-4 py-3 rounded-xl bg-gradient-to-r from-slate-500/20 to-gray-500/20 border border-slate-500/30 hover:border-slate-400/50 transition-all text-center">
            <p className="text-sm font-semibold text-white">Settings</p>
          </a>
        </div>
      </GlassCard>
    </motion.div>
  );
}
