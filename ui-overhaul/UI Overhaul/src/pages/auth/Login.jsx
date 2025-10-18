import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
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
          Welcome to Azora OS
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Sign in to your sovereign logistics platform
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

        <div style={{ marginBottom: '24px' }}>
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
              placeholder="Enter your password"
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
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <Link 
            to="/auth/forgot-password"
            style={{ 
              color: 'var(--accent-primary)', 
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Forgot your password?
          </Link>
        </div>
      </form>

      {/* Sign Up Link */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-primary)'
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link 
            to="/auth/signup"
            style={{ 
              color: 'var(--accent-primary)', 
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default Login
