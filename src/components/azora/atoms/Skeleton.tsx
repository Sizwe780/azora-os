import React from 'react';

interface SkeletonProps {
  lines?: number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 bg-white/10 rounded w-full" />
    ))}
  </div>
);

export default Skeleton;