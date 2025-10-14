import React from 'react'
import { motion } from 'framer-motion'

const ProgressIndicator = ({ steps, currentStep }) => {
  return (
    <div style={{ 
      padding: '40px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      {steps.map((step, index) => (
        <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
          <motion.div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              position: 'relative',
              background: index <= currentStep 
                ? 'linear-gradient(45deg, #8b5cf6, #06b6d4)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: index === currentStep 
                ? '2px solid #22c55e' 
                : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: index === currentStep 
                ? '0 0 30px rgba(34, 197, 94, 0.6)' 
                : index < currentStep 
                  ? '0 0 20px rgba(139, 92, 246, 0.4)' 
                  : 'none'
            }}
            animate={{
              scale: index === currentStep ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            {index < currentStep ? '✓' : index + 1}
          </motion.div>
          
          <div style={{ 
            marginLeft: '12px',
            display: 'flex',
            flexDirection: 'column',
            minWidth: '80px'
          }}>
            <span style={{ 
              fontSize: '14px',
              fontWeight: '600',
              color: index <= currentStep ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'
            }}>
              {step.title}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div style={{
              width: '40px',
              height: '2px',
              margin: '0 20px',
              background: index < currentStep 
                ? 'linear-gradient(90deg, #8b5cf6, #06b6d4)' 
                : 'rgba(255, 255, 255, 0.2)',
              borderRadius: '1px'
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default ProgressIndicator
