import React from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp } from 'lucide-react';
import { MarketOpportunity } from '../../features/ceo-insights/mockData';

const OpportunityCard: React.FC<{ opportunity: MarketOpportunity; index: number }> = ({ opportunity, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 h-full flex flex-col hover:bg-gray-800/80 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-white">{opportunity.region}</h3>
        <span className="text-sm font-semibold text-green-400 flex items-center gap-1">
          <TrendingUp size={16} />
          +{opportunity.growth}% Growth
        </span>
      </div>
      <div className="mb-3 flex-grow">
        <p className="text-sm text-gray-300">{opportunity.reasoning}</p>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">Opportunity Score</p>
        <div className="bg-gray-700 rounded-full h-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${opportunity.score}%` }}
            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
            className="bg-gradient-to-r from-green-500 to-teal-400 h-2.5 rounded-full"
          />
        </div>
        <p className="text-right text-xs text-green-300 mt-1 font-mono">{opportunity.score}%</p>
      </div>
    </motion.div>
  );
};

const MarketOpportunities: React.FC<{ opportunities: MarketOpportunity[] }> = ({ opportunities }) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-lg border border-green-500/30 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5" />
        <span>Market Expansion Opportunities</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {opportunities.map((opportunity, index) => (
          <OpportunityCard key={index} opportunity={opportunity} index={index} />
        ))}
      </div>
    </div>
  );
};

export default MarketOpportunities;
