import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '' }) => (
  <div className={`rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow ${className}`}>
    {children}
  </div>
);

export default GlassPanel;
export { GlassPanel };
