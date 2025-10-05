import React from 'react';
import { useLeaderboard } from '@/hooks/azora/useLeaderboard';
import Card from '@/components/azora/atoms/Card';
import Heading from '@/components/azora/atoms/Heading';
import Skeleton from '@/components/azora/atoms/Skeleton';
import LeaderboardRow from '@/components/azora/molecules/LeaderboardRow';

export function LeaderboardWidget() {
  const { entries, loading, error } = useLeaderboard({ pageSize: 5, sortBy: 'rank' });

  return (
    <Card className="p-5">
      <Heading>Leaderboard</Heading>
      {loading && <Skeleton lines={5} className="h-[220px]" />}
      {error && <div className="text-center text-red-500 p-4">Failed to load leaderboard</div>}
      {!loading && !error && (
        <div>
          {entries.map(e => (
            <LeaderboardRow key={e.userId} {...e} />
          ))}
        </div>
      )}
    </Card>
  );
}
