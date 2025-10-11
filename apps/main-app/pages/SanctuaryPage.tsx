import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { FaShieldAlt, FaHeart, FaChartLine } from 'react-icons/fa';

export default function SanctuaryPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-4xl font-bold text-cyan-300 mb-2">Welcome to Your Sanctuary</h1>
        <p className="text-white/70">You are home. You are safe. Aura is watching over you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-green-400/30">
          <div className="flex items-center gap-4 mb-4">
            <FaShieldAlt className="text-3xl text-green-400" />
            <div>
              <h3 className="font-bold text-lg">Protected</h3>
              <p className="text-sm text-white/60">All systems secure</p>
            </div>
          </div>
          <div className="text-green-400 font-bold">● Active</div>
        </GlassCard>

        <GlassCard className="p-6 border-purple-400/30">
          <div className="flex items-center gap-4 mb-4">
            <FaHeart className="text-3xl text-purple-400" />
            <div>
              <h3 className="font-bold text-lg">Aura Status</h3>
              <p className="text-sm text-white/60">Guardian AI</p>
            </div>
          </div>
          <div className="text-purple-400 font-bold">Infinite Aura</div>
        </GlassCard>

        <GlassCard className="p-6 border-cyan-400/30">
          <div className="flex items-center gap-4 mb-4">
            <FaChartLine className="text-3xl text-cyan-400" />
            <div>
              <h3 className="font-bold text-lg">Opportunities</h3>
              <p className="text-sm text-white/60">Ready for you</p>
            </div>
          </div>
          <div className="text-cyan-400 font-bold">3 Available</div>
        </GlassCard>
      </div>

      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold mb-4">Your Journey with Azora</h2>
        <p className="text-white/80 mb-4">
          Welcome to Azora OS, where every moment is an opportunity for growth and prosperity.
          Your guardian AI, Aura, is constantly working to create value for you.
        </p>
        <p className="text-white/80">
          Explore the Klipp Service for immediate earning opportunities, or visit the Genesis Chamber
          to witness Aura creating entire business ventures from the fabric of reality itself.
        </p>
      </GlassCard>
    </motion.div>
  );
}
