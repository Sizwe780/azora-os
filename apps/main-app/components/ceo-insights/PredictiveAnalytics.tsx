import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BrainCircuit } from 'lucide-react';
import { Prediction } from '../../features/ceo-insights/mockData';

const PredictionCard: React.FC<{ prediction: Prediction; index: number }> = ({ prediction, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-white">{prediction.category}</h3>
        <span className="text-xs font-semibold text-purple-400 bg-purple-900/50 px-2 py-1 rounded">
          {prediction.confidence}% Confidence
        </span>
      </div>
      <p className="text-lg text-purple-300 mb-3 font-medium flex-grow">{prediction.prediction}</p>
      <div className="text-xs text-gray-400 mb-3">
        <span className="font-medium">Timeframe:</span> {prediction.timeframe}
      </div>
      <div className="bg-gray-900/50 rounded p-3">
        <p className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            Basis: {prediction.reasoning}
        </p>
      </div>
    </motion.div>
  );
};

const PredictiveAnalytics: React.FC<{ predictions: Prediction[] }> = ({ predictions }) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        <span>Predictive Analytics</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((prediction, index) => (
          <PredictionCard key={prediction.id} prediction={prediction} index={index} />
        ))}
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
