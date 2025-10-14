import React from 'react'
import { motion } from 'framer-motion'

const PersonalInfoStep = ({ userData, setUserData }) => {
  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }))
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: '42px',
          fontWeight: 'bold',
          marginBottom: '16px',
          textAlign: 'center',
          background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Personal Information
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '50px',
          textAlign: 'center'
        }}
      >
        Please provide your basic information to continue
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 0 30px rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#ffffff'
          }}>
            Full Name *
          </label>
          <input
            type="text"
            value={userData.personalInfo.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#ffffff'
          }}>
            Email Address *
          </label>
          <input
            type="email"
            value={userData.personalInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email address"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#ffffff'
          }}>
            Phone Number *
          </label>
          <input
            type="tel"
            value={userData.personalInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter your phone number"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #22c55e, #16a34a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#ffffff'
          }}>
            🔒
          </div>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: 0
          }}>
            Your personal information is encrypted and secure
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default PersonalInfoStep
