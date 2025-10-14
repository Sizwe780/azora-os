import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Signup = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        role: 'user'
      })
      navigate('/onboarding')
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '40px' }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>A</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          Join Azora OS
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Create your sovereign logistics account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            background: 'var(--error)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            fontWeight: '500' 
          }}>
            Full Name
          </label>
          <div style={{ position: 'relative' }}>
            <User size={20} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              style={{ paddingLeft: '44px' }}
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              style={{ paddingLeft: '44px' }}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            fontWeight: '500' 
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              style={{ paddingLeft: '44px', paddingRight: '44px' }}
              placeholder="Create a password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            fontWeight: '500' 
          }}>
            Confirm Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              style={{ paddingLeft: '44px' }}
              placeholder="Confirm your password"
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
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {/* Sign In Link */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-primary)'
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link 
            to="/auth/login"
            style={{ 
              color: 'var(--accent-primary)', 
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default Signup
