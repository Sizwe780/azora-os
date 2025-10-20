
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

import { mockCEOInsightsData } from '../features/ceo-insights/mockData';
import MarketOpportunities from '../components/ceo-insights/MarketOpportunities';
import StrategicInsights from '../components/ceo-insights/StrategicInsights';
import PredictiveAnalytics from '../components/ceo-insights/PredictiveAnalytics';

export default function CEOInsightsPage() {
  const data = mockCEOInsightsData;

  return (
    <>
      <Helmet>
        <title>CEO Insights | Azora</title>
        <meta name="description" content="AI-driven strategic recommendations, market analysis, and predictive insights for the CEO." />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-950 min-h-screen text-white">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">AZORA CEO Insights</h1>
          <p className="text-blue-300/80 mt-1">AI-driven strategic recommendations, market analysis, and predictive insights.</p>
        </motion.div>

        <div className="space-y-6">
            <MarketOpportunities opportunities={data.marketOpportunities} />
            <StrategicInsights insights={data.insights} />
            <PredictiveAnalytics predictions={data.predictions} />
        </div>
      </div>
    </>
  );
}
