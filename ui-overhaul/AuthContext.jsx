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

  useEffect(() => {
    // Simulate auth check
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('azora-user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
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
    // Mock login
    const mockUser = {
      id: '1',
      email,
      name: 'John Doe',
      role: 'admin',
      onboardingComplete: true,
      subscription: 'business-pro',
      avatar: null
    }
    
    setUser(mockUser)
    localStorage.setItem('azora-user', JSON.stringify(mockUser))
    return mockUser
  }

  const signup = async (userData) => {
    // Mock signup
    const mockUser = {
      id: Date.now().toString(),
      ...userData,
      onboardingComplete: false,
      subscription: 'individual',
      avatar: null
    }
    
    setUser(mockUser)
    localStorage.setItem('azora-user', JSON.stringify(mockUser))
    return mockUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('azora-user')
  }

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('azora-user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}
