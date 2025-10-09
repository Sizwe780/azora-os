import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={`rounded-xl bg-white/40 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 shadow-lg p-4 ${className}`}
  >
    {children}
  </div>
);

export default Card;
export { Card };
