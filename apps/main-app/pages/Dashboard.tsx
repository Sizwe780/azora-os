import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Activity, TrendingUp, Shield } from 'lucide-react';
import { FaTruck, FaRobot } from 'react-icons/fa';

// A modern, reusable card component
const StatCard = ({ icon: Icon, label, value, change, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 rounded-lg bg-${color}-500/20`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
      <span className={`text-xs font-semibold ${change.startsWith('+') ? 'text-green-400' : 'text-yellow-400'}`}>{change}</span>
    </div>
    <h3 className="text-2xl font-bold text-white">{value}</h3>
    <p className="text-sm text-white/60">{label}</p>
  </motion.div>
);

// A modern, reusable service card component
const ServiceCard = ({ icon: Icon, name, desc, path, status, index }) => (
  <motion.a
    href={path}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    className="block group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl bg-cyan-500/10">
        <Icon className="w-6 h-6 text-cyan-400" />
      </div>
      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
        status === 'active' 
          ? 'bg-green-500/20 text-green-400'
          : 'bg-yellow-500/20 text-yellow-400'
      }`}>
        {status === 'active' ? '● Live' : '● Ready'}
      </span>
    </div>
    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">{name}</h3>
    <p className="text-sm text-white/60">{desc}</p>
  </motion.a>
);

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={stat.label} {...stat} index={idx} />
        ))}
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <FaRobot className="text-cyan-400" />
          <span>Your AI Services</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <ServiceCard key={service.name} {...service} index={idx} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/ai" className="text-center py-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">Ask Quantum AI</a>
          <a href="/tracking" className="text-center py-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">View Fleet</a>
          <a href="/evolution" className="text-center py-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">AI Evolution</a>
          <a href="/settings" className="text-center py-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">Settings</a>
        </div>
      </div>
    </motion.div>
  );
}
