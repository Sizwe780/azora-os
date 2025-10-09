import React from 'react';
import Avatar from '@/components/azora/atoms/Avatar';
import RankBadge from '@/components/azora/atoms/RankBadge';
import ReputationScore from '@/components/azora/atoms/ReputationScore';
import { LeaderboardEntry } from '@/services/leaderboard';

const LeaderboardRow: React.FC<LeaderboardEntry> = ({ username, avatarUrl, reputation, rank }) => {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-none">
      <div className="flex items-center gap-3">
        <Avatar username={username} avatarUrl={avatarUrl} />
        <span className="font-medium text-white/90">{username}</span>
      </div>
      <div className="flex items-center gap-4">
        <ReputationScore score={reputation} />
        <RankBadge rank={rank} />
      </div>
    </div>
  );
};

export default LeaderboardRow;
