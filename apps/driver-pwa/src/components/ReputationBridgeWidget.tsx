import React from 'react';
import { useInterNation } from '../../hooks/azora/useInterNation';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

export const ReputationBridgeWidget = () => {
  const { nations, isLoading, error } = useInterNation();

  const renderLoadingState = () => (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );

  const renderErrorState = () => (
    <p className="text-red-400 text-sm">
      Could not load reputation bridges: {error}
    </p>
  );

  const renderNations = () => (
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
  );

  return (
    <Card title="Reputation Bridges">
      {isLoading ? renderLoadingState() : (
        error ? renderErrorState() : (
          nations.length > 0 ? renderNations() : (
            <p className="text-sm text-white/70">No active reputation bridges.</p>
          )
        )
      )}
    </Card>
  );
};
