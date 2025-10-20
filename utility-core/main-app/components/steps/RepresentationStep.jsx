import React from 'react'
import { motion } from 'framer-motion'

const RepresentationStep = ({ userData, setUserData }) => {
  const userTypes = [
    {
      id: 'company',
      title: 'Company',
      icon: '🏢',
      description: 'Business entity or organization',
      gradient: 'linear-gradient(45deg, #8b5cf6, #a78bfa)'
    },
    {
      id: 'individual',
      title: 'Individual',
      icon: '👤',
      description: 'Personal account or freelancer',
      gradient: 'linear-gradient(45deg, #06b6d4, #0891b2)'
    },
    {
      id: 'others',
      title: 'Others',
      icon: '✨',
      description: 'Non-profit, government, or other',
      gradient: 'linear-gradient(45deg, #22c55e, #16a34a)'
    }
  ]

  const handleSelection = (userType) => {
    setUserData(prev => ({
      ...prev,
      userType
    }))
  }

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: '42px',
          fontWeight: 'bold',
          marginBottom: '16px',
          background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Who Are You Representing?
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          fontSize: '20px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '60px'
        }}
      >
        Choose the option that best describes your role
      </motion.p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {userTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelection(type.id)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '40px 30px',
              cursor: 'pointer',
              position: 'relative',
              border: userData.userType === type.id 
                ? '2px solid #8b5cf6' 
                : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: userData.userType === type.id 
                ? '0 0 40px rgba(139, 92, 246, 0.6)' 
                : '0 0 20px rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: userData.userType === type.id 
                ? '0 0 50px rgba(139, 92, 246, 0.8)' 
                : '0 0 30px rgba(139, 92, 246, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {userData.userType === type.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #22c55e, #16a34a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ✓
              </motion.div>
            )}
            
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: type.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              marginBottom: '24px',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)'
            }}>
              {type.icon}
            </div>
            
            <h3 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#ffffff'
            }}>
              {type.title}
            </h3>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              lineHeight: '1.5',
              textAlign: 'center'
            }}>
              {type.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default RepresentationStep
