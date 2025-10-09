import React from 'react';
import Card from './Card';

export const ReputationBridgeWidget: React.FC = () => {
  // Mock data for demo
  const nations = [
    { id: '1', name: 'Nation Alpha', endpoint: 'alpha.example.com' },
    { id: '2', name: 'Nation Beta', endpoint: 'beta.example.com' }
  ];

  return (
    <Card title="Reputation Bridges">
      <ul className="space-y-3">
        {nations.map(nation => (
          <li key={nation.id} className="glass p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-white/90">{nation.name}</p>
                <p className="text-xs text-white/60">{nation.endpoint}</p>
              </div>
              <span className="text-xs font-bold text-cyan-400">Bridge Active</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default ReputationBridgeWidget;
