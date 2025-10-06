import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`rounded-xl bg-slate-800/80 border border-white/10 shadow p-4 ${className}`}>
    {children}
  </div>
);

export default Card;
export { Card };