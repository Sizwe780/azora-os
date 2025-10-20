import React from 'react';

export function GlassCard({ children, className = '', accent = '' }: { children: React.ReactNode; className?: string; accent?: string }) {
  return (
    <div
      className={`rounded-2xl shadow-2xl backdrop-blur-lg bg-white/20 dark:bg-slate-900/30 border border-white/20 dark:border-slate-800/40 ${accent === 'premium' ? 'border-2 border-yellow-400/40' : ''} ${className} animate-float`}
      style={{
        boxShadow:
          accent === 'premium'
            ? '0 8px 40px 0 rgba(255, 215, 0, 0.13), 0 2px 12px 0 rgba(0,0,0,0.23)'
            : '0 4px 24px 0 rgba(0,0,0,0.13)',
      }}
    >
      {children}
    </div>
  );
}
