import React from 'react'
import { motion } from 'framer-motion'

const NavigationButtons = ({ currentStep, totalSteps, onNext, onPrev, canProceed }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      display: 'flex',
      gap: '15px',
      zIndex: 1000
    }}>
      {currentStep > 0 && (
        <motion.button
          onClick={onPrev}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          whileHover={{ 
            scale: 1.05,
            borderColor: 'rgba(255, 255, 255, 0.6)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          Previous
        </motion.button>
      )}
      
      {currentStep < totalSteps - 1 && (
        <motion.button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: canProceed 
              ? 'linear-gradient(45deg, #22c55e, #16a34a)' 
              : 'rgba(255, 255, 255, 0.1)',
            color: canProceed ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
            fontSize: '16px',
            fontWeight: '600',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            boxShadow: canProceed ? '0 0 20px rgba(34, 197, 94, 0.3)' : 'none'
          }}
          whileHover={canProceed ? { 
            scale: 1.05,
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)'
          } : {}}
          whileTap={canProceed ? { scale: 0.95 } : {}}
        >
          Next Step
        </motion.button>
      )}
    </div>
  )
}

export default NavigationButtons
