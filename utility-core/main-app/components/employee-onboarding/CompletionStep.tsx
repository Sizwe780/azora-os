import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface CompletionStepProps {
  firstName: string;
  onReset: () => void;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ firstName, onReset }) => {
  return (
    <div className="text-center py-10">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
      >
        <CheckCircle className="w-24 h-24 text-green-400 mx-auto" />
      </motion.div>
      <h2 className="text-3xl font-bold text-white mt-6">Onboarding Complete!</h2>
      <p className="text-gray-400 mt-2">Welcome to Azora, {firstName}! Your profile is ready.</p>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset} 
        className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-600/20"
      >
        Onboard Another Employee
      </motion.button>
    </div>
  );
};

export default CompletionStep;
