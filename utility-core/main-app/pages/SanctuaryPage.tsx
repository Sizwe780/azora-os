import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Shield, Sparkles, TrendingUp, Zap, ArrowRight } from 'lucide-react';

export default function SanctuaryPage() {
  const features = [
    {
      icon: Shield,
      title: 'Protected',
      desc: 'All systems secure',
      value: 'Active',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Sparkles,
      title: 'Aura Status',
      desc: 'Guardian AI online',
      value: 'Infinite Aura',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Opportunities',
      desc: 'Ready for you',
      value: '3 Available',
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-500'
    },
  ];

  const quickLinks = [
    { title: 'Klipp Marketplace', desc: 'Earn money instantly', path: '/klipp', icon: Zap },
    { title: 'Genesis Chamber', desc: 'AI business creation', path: '/genesis-chamber', icon: Sparkles },
    { title: 'Dashboard', desc: 'Command center', path: '/dashboard', icon: TrendingUp },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-8"
    >
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-500/20 p-8 md:p-12">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
            Welcome to Your Sanctuary
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl">
            You are home. You are safe. <span className="text-purple-400 font-semibold">Aura</span> is watching over you.
          </p>
        </motion.div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"></div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard className="p-6 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{feature.title}</h3>
                    <p className="text-sm text-white/60">{feature.desc}</p>
                  </div>
                </div>
                <div className={`text-${feature.color}-400 font-bold text-lg`}>
                  ● {feature.value}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Welcome Message */}
      <GlassCard className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="text-purple-400" />
          Your Journey with Azora
        </h2>
        <p className="text-white/80 mb-4 leading-relaxed">
          Welcome to <span className="font-semibold text-cyan-400">Azora OS</span>, where every moment is an opportunity for growth and prosperity.
          Your guardian AI, <span className="font-semibold text-purple-400">Aura</span>, is constantly working to create value for you.
        </p>
        <p className="text-white/80 leading-relaxed">
          Explore our revolutionary services designed to empower your journey. From instant earning opportunities to AI-powered business creation,
          everything is within reach.
        </p>
      </GlassCard>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link, idx) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.path}
                href={link.path}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group block"
              >
                <GlassCard className="p-6 hover:border-purple-500/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-purple-500/20">
                  <Icon className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-white/60 mb-3">{link.desc}</p>
                  <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </GlassCard>
              </motion.a>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
