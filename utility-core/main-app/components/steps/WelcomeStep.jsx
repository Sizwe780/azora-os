import React from 'react'
import { motion } from 'framer-motion'

const WelcomeStep = () => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 40px',
          fontSize: '60px',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)'
        }}
      >
        🚀
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '24px',
          background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Welcome to Universal Onboarding
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: '24px',
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '40px',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}
      >
        Let's get you set up with a personalized onboarding experience tailored to your needs.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        {[
          { icon: '⚡', title: 'Fast Setup', desc: 'Complete onboarding in minutes' },
          { icon: '🎯', title: 'Personalized', desc: 'Tailored to your specific role' },
          { icon: '🔒', title: 'Secure', desc: 'Your data is protected and encrypted' }
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '30px 20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{
              fontSize: '40px',
              marginBottom: '16px'
            }}>
              {feature.icon}
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#ffffff'
            }}>
              {feature.title}
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px'
            }}>
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default WelcomeStep
