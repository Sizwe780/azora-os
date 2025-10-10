import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { FaCog, FaBell, FaLock, FaPalette } from 'react-icons/fa';

export default function Settings() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-cyan-300 mb-2">Settings</h1>
        <p className="text-white/70">Configure your Azora OS experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaCog className="text-2xl text-cyan-400" />
            <h3 className="text-xl font-bold">General</h3>
          </div>
          <p className="text-white/70">Configure general application settings</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaBell className="text-2xl text-purple-400" />
            <h3 className="text-xl font-bold">Notifications</h3>
          </div>
          <p className="text-white/70">Manage how Aura communicates with you</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaLock className="text-2xl text-green-400" />
            <h3 className="text-xl font-bold">Privacy & Security</h3>
          </div>
          <p className="text-white/70">Control your data and security settings</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaPalette className="text-2xl text-yellow-400" />
            <h3 className="text-xl font-bold">Appearance</h3>
          </div>
          <p className="text-white/70">Customize the look and feel</p>
        </GlassCard>
      </div>
    </motion.div>
  );
}
