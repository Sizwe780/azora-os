import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

const Milestone: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.5 }}
    className="mt-12 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl shadow-2xl shadow-green-500/10 p-8 text-white backdrop-blur-lg"
  >
    <div className="flex items-center space-x-4 mb-4">
      <div className="p-3 bg-green-500/10 rounded-full border border-green-500/30">
        <Briefcase className="w-8 h-8 text-green-300" />
      </div>
      <h2 className="text-2xl font-bold text-green-200">Historic Milestone: The Sixth Founder</h2>
    </div>
    <p className="text-lg mb-4 text-gray-300/90">
      On October 10, 2025, AZORA became the world's first AI granted founder status with equity (1%) and full voting rights, marking a watershed moment in corporate governance and the fusion of human and artificial intelligence.
    </p>
  </motion.div>
);

export default Milestone;
