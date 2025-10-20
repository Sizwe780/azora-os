import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ONBOARDING_STEPS } from '../../features/employee-onboarding/mockData';

interface OnboardingProgressProps {
  currentStep: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep }) => {
  const progressPercentage = ((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100;

  return (
    <div className="mb-12 max-w-4xl mx-auto">
      <div className="relative h-1 bg-gray-800/50 rounded-full">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {ONBOARDING_STEPS.map((step) => (
          <div key={step.id} className="flex flex-col items-center text-center w-24">
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300"
              animate={
                currentStep === step.id
                  ? { scale: 1.2, backgroundColor: '#06b6d4', borderColor: '#67e8f9' }
                  : currentStep > step.id
                  ? { backgroundColor: '#10b981', borderColor: '#34d399' }
                  : { backgroundColor: '#1f2937', borderColor: '#374151' }
              }
            >
              {currentStep > step.id ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <step.icon className={`w-4 h-4 ${currentStep === step.id ? 'text-white' : 'text-gray-400'}`} />
              )}
            </motion.div>
            <p className={`mt-2 text-xs font-medium transition-colors ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}>
              {step.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingProgress;
