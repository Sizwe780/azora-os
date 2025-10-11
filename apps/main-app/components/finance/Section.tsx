import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, className = '' }) => (
  <div className={`bg-gray-950/50 border border-white/10 rounded-xl backdrop-blur-sm ${className}`}>
    <div className="p-6 border-b border-white/10 flex justify-between items-center">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <button className="text-gray-500 hover:text-white transition-colors">
        <MoreHorizontal />
      </button>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default Section;
