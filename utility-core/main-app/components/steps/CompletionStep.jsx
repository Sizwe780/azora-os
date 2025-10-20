import React from 'react'
import { motion } from 'framer-motion'

const CompletionStep = ({ userData }) => {
  const handleGetStarted = () => {
    // This would typically redirect to the main application
    console.log('Onboarding completed for:', userData)
    alert('Welcome to the platform! Redirecting to dashboard...')
  }

  const completionStats = [
    { label: 'Profile', value: '100%', icon: '👤' },
    { label: 'Verification', value: 'Complete', icon: '✅' },
    { label: 'Documents', value: `${userData.documents.length} uploaded`, icon: '📄' },
    { label: 'Status', value: 'Active', icon: '🟢' }
  ]

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #22c55e, #16a34a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 40px',
          fontSize: '80px',
          boxShadow: '0 0 60px rgba(34, 197, 94, 0.6)',
          animation: 'pulse-glow 2s ease-in-out infinite'
        }}
      >
        🎉
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #22c55e, #16a34a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Welcome Aboard!
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          fontSize: '24px',
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '50px',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 50px'
        }}
      >
        Congratulations! Your onboarding is complete. You're now ready to explore all the features and start your journey with us.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          maxWidth: '800px',
          margin: '0 auto 50px'
        }}
      >
        {completionStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '30px 20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{
              fontSize: '32px',
              marginBottom: '12px'
            }}>
              {stat.icon}
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '6px',
              color: '#ffffff'
            }}>
              {stat.label}
            </h3>
            <p style={{
              color: '#22c55e',
              fontSize: '16px',
              fontWeight: '500',
              margin: 0
            }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
      >
        <motion.button
          onClick={handleGetStarted}
          style={{
            padding: '16px 40px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(45deg, #22c55e, #16a34a)',
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)',
            transition: 'all 0.3s ease'
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 40px rgba(34, 197, 94, 0.6)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started Now
        </motion.button>
        
        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          margin: 0
        }}>
          Need help? Contact our support team anytime
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          marginTop: '60px',
          padding: '30px',
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '16px',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          maxWidth: '600px',
          margin: '60px auto 0'
        }}
      >
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#ffffff'
        }}>
          What's Next?
        </h3>
        <ul style={{
          listStyle: 'none',
          textAlign: 'left',
          color: 'rgba(255, 255, 255, 0.8)',
          lineHeight: '1.8'
        }}>
          <li style={{ marginBottom: '8px' }}>🎯 Complete your profile setup</li>
          <li style={{ marginBottom: '8px' }}>📊 Explore the dashboard features</li>
          <li style={{ marginBottom: '8px' }}>🤝 Connect with your team members</li>
          <li>📚 Check out our getting started guide</li>
        </ul>
      </motion.div>
    </div>
  )
}

export default CompletionStep
