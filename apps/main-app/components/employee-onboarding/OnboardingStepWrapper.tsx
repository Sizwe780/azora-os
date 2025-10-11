import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ONBOARDING_STEPS } from '../../features/employee-onboarding/mockData';

interface OnboardingStepWrapperProps {
  currentStep: number;
  handleNext: () => void;
  handleBack: () => void;
  children: React.ReactNode;
}

const OnboardingStepWrapper: React.FC<OnboardingStepWrapperProps> = ({ currentStep, handleNext, handleBack, children }) => {
  const step = ONBOARDING_STEPS[currentStep - 1];

  return (
    <div className="bg-gray-950/50 border border-white/10 rounded-xl shadow-2xl max-w-4xl mx-auto backdrop-blur-lg">
      <div className="p-8 border-b border-white/10 flex items-center gap-4">
        <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center">
            <step.icon className="w-6 h-6 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-white">{step.name}</h2>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="p-8"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      
      {currentStep < ONBOARDING_STEPS.length && (
        <div className="flex justify-between p-6 bg-black/20 border-t border-white/10 rounded-b-xl">
          <motion.button
            onClick={handleBack}
            disabled={currentStep === 1}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-lg hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </motion.button>
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-cyan-600/20"
          >
            <span>{currentStep === ONBOARDING_STEPS.length - 1 ? 'Finish & Submit' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default OnboardingStepWrapper;
