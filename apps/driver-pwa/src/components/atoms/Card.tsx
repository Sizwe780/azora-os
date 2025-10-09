import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = "" }) => (
  <div className={`glass rounded-2xl shadow-xl p-6 mb-4 ${className}`}>
    {title && <h2 className="text-xl font-bold mb-3 text-white/90">{title}</h2>}
    {children}
  </div>
);

export default Card;
