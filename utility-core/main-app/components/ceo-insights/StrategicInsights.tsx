import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, DollarSign, Leaf, Zap, Shield, TrendingUp, Wrench, Truck, Activity } from 'lucide-react';
import { Insight } from '../../features/ceo-insights/mockData';
import { formatDistanceToNow } from 'date-fns';

const IMPACT_MAP = {
  critical: { color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-900/30' },
  high: { color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-900/30' },
  medium: { color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-900/30' },
  low: { color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-900/30' },
};

const ICON_MAP: { [key: string]: React.ElementType } = {
    DollarSign, Leaf, Zap, Shield, TrendingUp, Wrench, Truck, Activity, Target
};

const InsightCard: React.FC<{ insight: Insight; index: number }> = ({ insight, index }) => {
  const { color, border, bg } = IMPACT_MAP[insight.impact];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`rounded-xl p-5 border ${border} ${bg}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${bg}`}>
            <Target className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{insight.title}</h3>
            <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{insight.impact} Impact</span>
          </div>
        </div>
        <div className="text-right">
            <span className="text-sm font-semibold text-white bg-gray-900/50 px-3 py-1 rounded-full">
              {insight.confidence}%
            </span>
            <p className="text-xs text-gray-400 mt-1">Confidence</p>
        </div>
      </div>
      <p className="text-sm mb-4 text-gray-300">{insight.description}</p>
      
      <div className="bg-gray-900/40 rounded-lg p-4 mb-4">
        <p className="text-sm font-semibold mb-2 text-white flex items-center gap-2">
            <Lightbulb className={`w-4 h-4 ${color}`} />
            AI Recommendation
        </p>
        <p className="text-sm text-gray-300">{insight.recommendation}</p>
      </div>

      <div>
        <p className="text-xs font-semibold mb-2 text-gray-400">Key Data Points:</p>
        <div className="flex flex-wrap gap-2">
          {insight.dataPoints.map((point, idx) => {
            const Icon = ICON_MAP[point.icon as string];
            return (
              <span key={idx} className="text-xs px-3 py-1.5 bg-gray-800/70 rounded-full text-gray-300 flex items-center gap-2">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {point.text}
              </span>
            );
          })}
        </div>
      </div>
       <p className="text-xs text-gray-500 text-right mt-4">
        Generated {formatDistanceToNow(new Date(insight.createdAt), { addSuffix: true })}
      </p>
    </motion.div>
  );
};

const StrategicInsights: React.FC<{ insights: Insight[] }> = ({ insights }) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5" />
        <span>AI-Generated Strategic Insights</span>
      </h2>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <InsightCard key={insight.id} insight={insight} index={index} />
        ))}
      </div>
    </div>
  );
};

export default StrategicInsights;
