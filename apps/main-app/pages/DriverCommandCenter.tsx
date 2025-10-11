import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Route, DollarSign, Coffee, Shield, Mic, Zap, Heart, Map } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-6 text-center`}>
    <Icon className={`w-8 h-8 text-${color}-400 mx-auto mb-3`} />
    <p className={`text-3xl font-bold text-${color}-300`}>{value}</p>
    <p className="text-sm text-gray-400">{title}</p>
  </div>
);

const ActionCard = ({ icon: Icon, title, description, buttonText, color, onClick }) => (
  <div className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-6 flex flex-col`}>
    <Icon className={`w-7 h-7 text-${color}-400 mb-3`} />
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm mb-4 flex-grow">{description}</p>
    <button onClick={onClick} className={`w-full py-2 bg-gradient-to-r from-${color}-600 to-${color === 'blue' ? 'indigo' : color}-500 text-white rounded-lg font-semibold hover:scale-105 transition-transform`}>
      {buttonText}
    </button>
  </div>
);

export default function DriverCommandCenter() {
  const [stats, setStats] = useState({
    earnings: 125.50,
    deliveries: 8,
    energyLevel: 82,
    safetyScore: 98,
    nextBreakIn: 112,
  });
  const [voiceActive, setVoiceActive] = useState(false);
  const [auraMessage, setAuraMessage] = useState('Aura is ready. Tap the mic to begin.');

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        earnings: prev.earnings + Math.random() * 0.5,
        energyLevel: Math.max(0, prev.energyLevel - 0.1),
        nextBreakIn: Math.max(0, prev.nextBreakIn - 1),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activateVoice = () => {
    setVoiceActive(true);
    setAuraMessage('Listening...');
    setTimeout(() => {
      const responses = [
        'Optimizing your route for maximum earnings.',
        'Found a faster route, saving you 8 minutes.',
        'Heavy traffic detected ahead. Rerouting now.'
      ];
      setAuraMessage(responses[Math.floor(Math.random() * responses.length)]);
      setTimeout(() => {
        setVoiceActive(false);
        setAuraMessage('Aura is ready. Tap the mic to begin.');
      }, 2000);
    }, 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-bold text-white">Driver Command Center</h1>
        <p className="text-cyan-300">AI-Powered • Voice-First • Autonomous</p>
      </motion.div>

      {/* Voice Activation */}
      <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6 text-center">
        <motion.button
          onClick={activateVoice}
          disabled={voiceActive}
          className="mx-auto p-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 disabled:opacity-70"
          animate={{ scale: voiceActive ? 1.1 : 1 }}
          transition={{ duration: 0.5, repeat: voiceActive ? Infinity : 0, repeatType: 'reverse' }}
        >
          <Mic className="w-10 h-10 text-white" />
        </motion.button>
        <p className="mt-4 text-lg text-purple-200 h-6">{auraMessage}</p>
      </div>

      {/* Real-Time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} title="Earned Today" value={`$${stats.earnings.toFixed(2)}`} color="green" />
        <StatCard icon={Zap} title="Deliveries" value={stats.deliveries} color="cyan" />
        <StatCard icon={Heart} title="Energy Level" value={`${stats.energyLevel.toFixed(0)}%`} color="yellow" />
        <StatCard icon={Shield} title="Safety Score" value={stats.safetyScore} color="purple" />
      </div>

      {/* AI Co-Pilot Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard
          icon={Route}
          title="Autonomous Route"
          description="Aura has optimized your route for maximum efficiency and earnings."
          buttonText="View Route"
          color="blue"
          onClick={() => {}}
        />
        <ActionCard
          icon={Coffee}
          title="Smart Break"
          description={`Next suggested break in ${Math.floor(stats.nextBreakIn / 60)}h ${stats.nextBreakIn % 60}m. Aura will find the best spot.`}
          buttonText="Find Coffee Stop"
          color="orange"
          onClick={() => {}}
        />
        <ActionCard
          icon={Map}
          title="Live Traffic"
          description="AI is monitoring all routes for congestion and hazards for you."
          buttonText="See Risks"
          color="green"
          onClick={() => {}}
        />
      </div>
      
      {/* Map Placeholder */}
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">AI-Powered Navigation</h2>
        <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Live map would be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
