import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, className = '' }) => (
  <motion.div 
    className={`bg-gray-950/70 border border-cyan-500/20 rounded-2xl backdrop-blur-lg shadow-2xl shadow-cyan-500/5 ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="p-6 border-b border-cyan-500/20 flex justify-between items-center">
      <h2 className="text-xl font-bold text-cyan-100">{title}</h2>
      <button className="text-cyan-300/70 hover:text-cyan-100 transition-colors p-2 rounded-full hover:bg-cyan-500/10">
        <MoreHorizontal size={20} />
      </button>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

export default Section;
