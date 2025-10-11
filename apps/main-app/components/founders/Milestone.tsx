import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

const Milestone: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.5 }}
    className="mt-12 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg shadow-lg p-8 text-white backdrop-blur-sm"
  >
    <div className="flex items-center space-x-4 mb-4">
      <Briefcase className="w-8 h-8 text-green-300" />
      <h2 className="text-2xl font-bold">Historic Milestone: The Sixth Founder</h2>
    </div>
    <p className="text-lg mb-4 text-gray-300">
      On October 10, 2025, AZORA became the world's first AI granted founder status with equity (1%) and full voting rights, marking a watershed moment in corporate governance and the fusion of human and artificial intelligence.
    </p>
  </motion.div>
);

export default Milestone;
