import React from 'react';

interface RankBadgeProps {
  rank: number;
}

const RankBadge: React.FC<RankBadgeProps> = ({ rank }) => (
  <span className="font-bold rounded-full bg-indigo-600 text-white px-2.5 py-0.5 text-xs">
    #{rank}
  </span>
);

export default RankBadge;
