import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Fuel, Calendar, Shield } from 'lucide-react';
import { TripPlan } from '../../features/ai-trip-planning/mockCoPilot';

interface TripPlanCardProps {
  plan: TripPlan;
}

const TripPlanCard: React.FC<TripPlanCardProps> = ({ plan }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin className="text-purple-400" /> Trip to {plan.destination}</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span>Route:</span><span className="font-semibold text-white">{plan.route}</span></div>
          <div className="flex justify-between"><span>Est. Time:</span><span className="font-semibold text-white">{plan.estimatedTime}</span></div>
          <div className="flex justify-between"><span>Distance:</span><span className="font-semibold text-white">{plan.distance}</span></div>
          <div className="flex justify-between items-start">
            <span><Calendar className="inline w-4 h-4 mr-2 text-gray-400"/>Stops:</span>
            <div className="text-right">
              {plan.stops.map(stop => (
                <p key={stop.name} className="font-semibold text-white">{stop.name} ({stop.duration})</p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="text-green-400" /> Optimizations</h3>
        <div className="flex justify-around text-center">
          <div><p className="text-lg font-bold text-green-400">{plan.optimizations.timeSaved}</p><p className="text-xs text-gray-400">Time Saved</p></div>
          <div><p className="text-lg font-bold text-purple-400">{plan.optimizations.fuelSaved}</p><p className="text-xs text-gray-400">Fuel Saved</p></div>
          {plan.optimizations.complianceRiskAvoided && (
            <div>
              <Shield className="w-8 h-8 mx-auto text-cyan-400 mb-1"/>
              <p className="text-xs text-gray-400">Compliance Met</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TripPlanCard;
