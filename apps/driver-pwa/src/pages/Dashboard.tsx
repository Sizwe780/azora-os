import React, { useEffect } from 'react';
import { useMetrics } from '../context/MetricsProvider';
import { useAlert } from '../context/AlertProvider';

const DashboardPage = () => {
  const { metrics } = useMetrics();
  const { fetchAndSetFeedback } = useAlert();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/10 rounded-lg">
          <p className="text-sm text-white/70">Reputation</p>
          <p className="text-3xl font-bold">{metrics.reputation_score.toFixed(1)}</p>
        </div>
        <div className="p-4 bg-white/10 rounded-lg">
          <p className="text-sm text-white/70">Profit</p>
          <p className="text-3xl font-bold">${metrics.profit.toLocaleString()}</p>
        </div>
      </div>
      <button 
        onClick={() => fetchAndSetFeedback(metrics)}
        className="mt-6 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
      >
        Get Feedback
      </button>
    </div>
  );
};

export default DashboardPage;