import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Mock password reset
    setTimeout(() => {
      setSent(true)
      setLoading(false)
    }, 1000)
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ padding: '40px', textAlign: 'center' }}
      >
        <div style={{
          width: '60px',
          height: '60px',
          background: 'var(--success)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Mail size={24} style={{ color: 'white' }} />
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
          Check Your Email
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          We've sent a password reset link to {email}
        </p>
        
        <Link to="/auth/login" className="btn-primary" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '40px' }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          Reset Password
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Enter your email to receive a reset link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            fontWeight: '500' 
          }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              style={{ paddingLeft: '44px' }}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ 
            width: '100%', 
            justifyContent: 'center',
            marginBottom: '20px'
          }}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      {/* Back Link */}
      <div style={{ textAlign: 'center' }}>
        <Link 
          to="/auth/login"
          style={{ 
            color: 'var(--accent-primary)', 
            textDecoration: 'none',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </div>
    </motion.div>
  )
}

export default ForgotPassword
