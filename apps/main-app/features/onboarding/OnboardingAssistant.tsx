// features/onboarding/OnboardingAssistant.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, X } from 'lucide-react';

const onboardingQuestions = [
  'Welcome! What is your company name?',
  'How many vehicles are in your fleet?',
  'What is your main business focus?',
  'Would you like to enable compliance automation?',
  'Do you want to integrate voice control?',
  'Which South African languages should we support for your team?',
];

export const OnboardingAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleNext = () => {
    setAnswers([...answers, input]);
    setInput('');
    setStep(step + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-900 border border-cyan-500/50 rounded-2xl w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Onboarding Assistant</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {step < onboardingQuestions.length ? (
            <>
              <p className="text-sm text-gray-400 mb-2">{onboardingQuestions[step]}</p>
              <input
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white w-full focus:ring-2 focus:ring-cyan-500 outline-none"
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
              />
              <button
                onClick={handleNext}
                disabled={!input}
                className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                Next
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-green-400 font-bold">Onboarding Complete!</p>
              <p className="text-gray-300 text-sm">Your answers:</p>
              <ul className="text-xs text-gray-400 list-disc pl-4">
                {answers.map((ans, i) => (
                  <li key={i}>{onboardingQuestions[i]} <span className="font-mono text-cyan-300">{ans}</span></li>
                ))}
              </ul>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
