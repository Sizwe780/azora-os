import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { DollarSign, Zap, Heart, Shield, User } from 'lucide-react';

import {
  initialStats,
  coPilotActions,
  initialRouteInfo,
  auraResponses,
  DriverStats,
  RouteInfo,
} from '../features/driver-command/mockData';

import StatCard from '../components/driver-command/StatCard';
import VoiceActivationPanel from '../components/driver-command/VoiceActivationPanel';
import ActionCard from '../components/driver-command/ActionCard';
import RouteInfoPanel from '../components/driver-command/RouteInfoPanel';

export default function DriverCommandCenter() {
  const [stats, setStats] = useState<DriverStats>(initialStats);
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(initialRouteInfo);
  const [isListening, setIsListening] = useState(false);
  const [auraMessage, setAuraMessage] = useState(auraResponses.ready);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        earnings: prev.earnings + Math.random() * 0.5,
        energyLevel: Math.max(0, prev.energyLevel - 0.1),
        nextBreakIn: Math.max(0, prev.nextBreakIn - 1/60), // decrement minutes
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activateVoice = () => {
    setIsListening(true);
    setAuraMessage(auraResponses.listening);
    setTimeout(() => {
      setAuraMessage(auraResponses.processing);
      setTimeout(() => {
        const randomResponse = auraResponses.responses[Math.floor(Math.random() * auraResponses.responses.length)];
        setAuraMessage(randomResponse);
        setTimeout(() => {
          setIsListening(false);
          setAuraMessage(auraResponses.ready);
        }, 2500);
      }, 1500);
    }, 2000);
  };

  const handleActionClick = (path: string) => {
    // In a real app, you'd use a router to navigate.
    console.log(`Navigating to ${path}`);
    setAuraMessage(`Showing you the ${path.replace('/', '')} screen.`);
    setTimeout(() => setAuraMessage(auraResponses.ready), 2000);
  };

  const statCards = [
    { icon: DollarSign, title: "Earned Today", value: `$${stats.earnings.toFixed(2)}`, color: 'green' },
    { icon: Zap, title: "Deliveries", value: stats.deliveries.toString(), color: 'cyan' },
    { icon: Heart, title: "Energy Level", value: `${stats.energyLevel.toFixed(0)}%`, color: 'yellow' },
    { icon: Shield, title: "Safety Score", value: stats.safetyScore.toString(), color: 'purple' },
  ];

  return (
    <>
      <Helmet>
        <title>Driver Command Center | Azora</title>
        <meta name="description" content="Your AI Co-Pilot for the road. Voice-first, autonomous, and optimized for maximum earnings and safety." />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-950 min-h-screen text-white">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
            <User className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Driver Command Center</h1>
            <p className="text-cyan-300/80">Your AI Co-Pilot for the Road</p>
          </div>
        </motion.div>

        <VoiceActivationPanel
          isListening={isListening}
          auraMessage={auraMessage}
          onActivate={activateVoice}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <StatCard key={stat.title} {...stat} index={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coPilotActions.map((action, index) => (
            <ActionCard key={action.id} action={action} index={index} onClick={handleActionClick} />
          ))}
        </div>
        
        <RouteInfoPanel routeInfo={routeInfo} />
      </div>
    </>
  );
}
