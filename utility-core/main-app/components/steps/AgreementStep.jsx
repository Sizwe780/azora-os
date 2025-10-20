import React from 'react'
import { motion } from 'framer-motion'

const AgreementStep = ({ userData, setUserData }) => {
  const handleAgreementChange = (checked) => {
    setUserData(prev => ({
      ...prev,
      agreementAccepted: checked
    }))
  }

  const agreements = [
    {
      title: 'Terms of Service',
      description: 'Our terms and conditions for using the platform',
      required: true
    },
    {
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your data',
      required: true
    },
    {
      title: 'Data Processing Agreement',
      description: 'Terms for processing your business data',
      required: true
    }
  ]

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
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
        Terms & Agreements
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
        Please review and accept our terms to complete your onboarding
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
          boxShadow: '0 0 30px rgba(255, 255, 255, 0.1)',
          marginBottom: '40px'
        }}
      >
        <div style={{ marginBottom: '30px' }}>
          {agreements.map((agreement, index) => (
            <motion.div
              key={agreement.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '15px',
                padding: '20px',
                marginBottom: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                background: 'linear-gradient(45deg, #8b5cf6, #a78bfa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#ffffff',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                📄
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '6px'
                }}>
                  {agreement.title}
                  {agreement.required && (
                    <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                  )}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '12px'
                }}>
                  {agreement.description}
                </p>
                <button style={{
                  background: 'transparent',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: '#8b5cf6',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  View Document
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            padding: '30px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '16px',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            textAlign: 'center'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <input
              type="checkbox"
              id="agreement-checkbox"
              checked={userData.agreementAccepted}
              onChange={(e) => handleAgreementChange(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                accentColor: '#22c55e',
                cursor: 'pointer'
              }}
            />
            <label
              htmlFor="agreement-checkbox"
              style={{
                fontSize: '16px',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              I have read and agree to all terms and conditions
            </label>
          </div>
          
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0
          }}>
            By checking this box, you confirm that you understand and accept all the terms outlined above.
          </p>
        </motion.div>
      </motion.div>

      {userData.agreementAccepted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            textAlign: 'center'
          }}
        >
          <div style={{
            fontSize: '24px',
            marginBottom: '8px'
          }}>
            ✅
          </div>
          <p style={{
            color: '#22c55e',
            fontSize: '16px',
            fontWeight: '600',
            margin: 0
          }}>
            Agreement accepted! You're ready to proceed.
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default AgreementStep
