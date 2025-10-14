import React from 'react'
import { motion } from 'framer-motion'

const BusinessDetailsStep = ({ userData, setUserData }) => {
  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      businessDetails: {
        ...prev.businessDetails,
        [field]: value
      }
    }))
  }

  const businessTypes = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Other'
  ]

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
        Business Details
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
        Tell us about your business to customize your experience
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
            Business Name *
          </label>
          <input
            type="text"
            value={userData.businessDetails.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Enter your business name"
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
            Business Type
          </label>
          <select
            value={userData.businessDetails.businessType}
            onChange={(e) => handleInputChange('businessType', e.target.value)}
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
          >
            <option value="">Select business type</option>
            {businessTypes.map(type => (
              <option key={type} value={type} style={{ background: '#1a1a2e', color: '#ffffff' }}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#ffffff'
          }}>
            Business Location *
          </label>
          <input
            type="text"
            value={userData.businessDetails.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="City, State/Province, Country"
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
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #8b5cf6, #a78bfa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#ffffff'
          }}>
            🏢
          </div>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: 0
          }}>
            Business information helps us provide relevant features and compliance
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default BusinessDetailsStep
