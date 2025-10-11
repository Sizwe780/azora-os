import React from 'react';
// src/pages/DriverCommandCenter.tsx
/**
 * THE DRIVER COMMAND CENTER
 * 
 * A revolutionary, voice-first interface for drivers.
 * Features autonomous route planning, AI safety co-pilot,
 * real-time earnings, and smart break recommendations.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { GlassCard } from '../components/ui/GlassCard';
import { 
  FaRoute, FaDollarSign, FaCoffee, FaShieldAlt, 
  FaMicrophone, FaBolt, FaHeart, FaMapMarkedAlt 
} from 'react-icons/fa';
import TrackingMap from '../app/TrackingMap';

type DriverStats = {
  earnings: number;
  deliveries: number;
  energyLevel: number;
  currentRoute: string;
  nextBreakIn: number; // minutes
  safetyScore: number;
};

export default function DriverCommandCenter() {
  const [stats, setStats] = useState<DriverStats>({
    earnings: 0,
    deliveries: 0,
    energyLevel: 100,
    currentRoute: 'No active route',
    nextBreakIn: 120,
    safetyScore: 100,
  });
  
  const [voiceActive, setVoiceActive] = useState(false);
  const [auraMessage, setAuraMessage] = useState('Aura is ready. Say "Hey Aura" to begin.');

  useEffect(() => {
    // Simulate real-time earnings
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        earnings: prev.earnings + (Math.random() * 2),
        energyLevel: Math.max(0, prev.energyLevel - 0.5),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const activateVoice = () => {
    setVoiceActive(!voiceActive);
    if (!voiceActive) {
      setAuraMessage('🎤 Listening... How can I help you?');
      // In production, this would activate real speech recognition
      setTimeout(() => {
        setAuraMessage('Got it! Optimizing your route for maximum earnings.');
        setVoiceActive(false);
      }, 3000);
    }
  };

  const requestBreak = async () => {
    try {
      const res = await axios.post('/api/neural/context/update', {
        employeeId: 'driver_001',
        action: { type: 'break_requested' },
      });
      setAuraMessage(res.data.prediction.message);
    } catch (error) {
      console.error('Request break error:', error);
      setAuraMessage('Finding the perfect coffee stop for you...');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-cyan-300 mb-2">Driver Command Center</h1>
        <p className="text-white/70">AI-Powered. Voice-First. Autonomous.</p>
      </div>

      {/* Voice Activation */}
      <GlassCard className="p-8 text-center border-purple-400/50">
        <motion.div
          animate={{ scale: voiceActive ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: voiceActive ? Infinity : 0, duration: 1.5 }}
        >
          <button
            onClick={activateVoice}
            className={`p-8 rounded-full ${voiceActive ? 'bg-purple-600' : 'bg-cyan-600'} hover:opacity-80 transition-all`}
          >
            <FaMicrophone className="text-6xl text-white" />
          </button>
        </motion.div>
        <p className="mt-4 text-xl text-purple-300">{auraMessage}</p>
      </GlassCard>

      {/* Real-Time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-6 text-center border-green-400/30">
          <FaDollarSign className="text-4xl text-green-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-green-300">${stats.earnings.toFixed(2)}</p>
          <p className="text-sm text-white/60">Earned Today</p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-cyan-400/30">
          <FaBolt className="text-4xl text-cyan-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-cyan-300">{stats.deliveries}</p>
          <p className="text-sm text-white/60">Deliveries</p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-yellow-400/30">
          <FaHeart className="text-4xl text-yellow-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-yellow-300">{stats.energyLevel.toFixed(0)}%</p>
          <p className="text-sm text-white/60">Energy Level</p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-purple-400/30">
          <FaShieldAlt className="text-4xl text-purple-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-purple-300">{stats.safetyScore}</p>
          <p className="text-sm text-white/60">Safety Score</p>
        </GlassCard>
      </div>

      {/* AI Co-Pilot Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <FaRoute className="text-3xl text-blue-400 mb-3" />
          <h3 className="text-xl font-bold mb-2">Autonomous Route</h3>
          <p className="text-white/70 text-sm mb-4">Aura has optimized your route for maximum efficiency.</p>
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold">
            View Route
          </button>
        </GlassCard>

        <GlassCard className="p-6">
          <FaCoffee className="text-3xl text-orange-400 mb-3" />
          <h3 className="text-xl font-bold mb-2">Smart Break</h3>
          <p className="text-white/70 text-sm mb-4">Next suggested break in {stats.nextBreakIn} minutes.</p>
          <button 
            onClick={requestBreak}
            className="w-full py-2 bg-orange-600 hover:bg-orange-500 rounded-lg font-semibold"
          >
            Find Coffee Stop
          </button>
        </GlassCard>

        <GlassCard className="p-6">
          <FaMapMarkedAlt className="text-3xl text-green-400 mb-3" />
          <h3 className="text-xl font-bold mb-2">Live Traffic</h3>
          <p className="text-white/70 text-sm mb-4">AI is monitoring all routes for you.</p>
          <button className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold">
            See Risks
          </button>
        </GlassCard>
      </div>

      {/* Map */}
      <GlassCard className="p-4">
        <h2 className="text-2xl font-bold mb-4">AI-Powered Navigation</h2>
        <TrackingMap />
      </GlassCard>
    </motion.div>
  );
}
