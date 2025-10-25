import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('azora-user')
        const storedToken = localStorage.getItem('azora-token')
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser))
          setToken(storedToken)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      // Simulate login - replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      const mockUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        onboardingComplete: data.user.onboardingComplete || true,
        role: data.user.role || 'user'
      }
      setUser(mockUser)
      setToken(data.token)
      localStorage.setItem('azora-user', JSON.stringify(mockUser))
      localStorage.setItem('azora-token', data.token)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('azora-user')
    localStorage.removeItem('azora-token')
  }

  const signup = async (userData) => {
    try {
      // Simulate signup - replace with actual API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('Signup failed')
      }

      const data = await response.json()
      const mockUser = {
        id: data.user.id,
        ...userData,
        onboardingComplete: false,
        role: 'user'
      }
      setUser(mockUser)
      setToken(data.token)
      localStorage.setItem('azora-user', JSON.stringify(mockUser))
      localStorage.setItem('azora-token', data.token)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    signup
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}