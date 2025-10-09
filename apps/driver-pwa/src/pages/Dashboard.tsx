import React from 'react';
import { useMetrics } from '../context/MetricsProvider';
import { useAlert } from '../context/AlertProvider';
import { Card } from '../components/ui/Card';
import { ReputationBridgeWidget } from '../components/azora/ReputationBridgeWidget';
import { CrossNationProposalsWidget } from '../components/azora/CrossNationProposalsWidget';

const DashboardPage = () => {
  const { metrics } = useMetrics();
  const { fetchAndSetFeedback } = useAlert();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Key Metrics card spans two columns */}
      <div className="lg:col-span-2">
        <Card title="Key Metrics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-lg">
              <p className="text-sm text-white/70">Reputation</p>
              <p className="text-3xl font-bold">{metrics.reputation_score.toFixed(1)}</p>
            </div>
            <div className="glass p-4 rounded-lg">
              <p className="text-sm text-white/70">Profit</p>
              <p className="text-3xl font-bold">${metrics.profit.toLocaleString()}</p>
            </div>
            <div className="glass p-4 rounded-lg">
              <p className="text-sm text-white/70">Trips Completed</p>
              <p className="text-3xl font-bold">{metrics.trips_completed}</p>
            </div>
            <div className="glass p-4 rounded-lg">
              <p className="text-sm text-white/70">Trips Missed</p>
              <p className="text-3xl font-bold">{metrics.trips_missed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Emotional Feedback card */}
      <div className="lg:col-span-1">
        <Card title="Emotional Feedback Engine">
          <p className="text-sm text-white/70">
            Enforcing Article IV: Emotion is Infrastructure. Get feedback on your performance.
          </p>
          <button 
            onClick={() => fetchAndSetFeedback(metrics)}
            className="mt-4 w-full px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Analyze My Performance
          </button>
        </Card>
      </div>

      {/* NEW: Federation Section */}
      <div className="lg:col-span-2">
        <CrossNationProposalsWidget />
      </div>

      <div className="lg:col-span-1">
        <ReputationBridgeWidget />
      </div>

    </div>
  );
};

export default DashboardPage;
