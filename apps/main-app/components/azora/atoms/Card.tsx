import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <section className={`rounded-xl bg-white/5 border border-white/10 shadow p-4 space-y-3 ${className}`}>
      {title && <h2 className="font-semibold text-white/90">{title}</h2>}
      {children}
    </section>
  );
}

export default Card;