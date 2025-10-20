import React from 'react';
import { Star } from 'lucide-react';

interface ReputationScoreProps {
  score: number;
}

const ReputationScore: React.FC<ReputationScoreProps> = ({ score }) => (
  <div className="flex items-center gap-1 text-sm text-cyan-400">
    <Star className="w-4 h-4" />
    <span className="font-semibold">{score.toLocaleString()}</span>
  </div>
);

export default ReputationScore;
