import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role?: 'student' | 'developer' | 'enterprise' | 'admin'
  trustScore?: number
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  signup: () => Promise<void>
  getRedirectUrl: (user: User) => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // In production, this would validate JWT token with Azora Identity service
      // For now, check localStorage for demo purposes
      const storedUser = localStorage.getItem('azora_user')
      const token = localStorage.getItem('azora_auth_token')

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)

        // In production, validate token with backend
        // const response = await fetch('/api/auth/validate', {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // })
        // if (response.ok) {
        //   setUser(parsedUser)
        // } else {
        //   logout()
        // }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const getRedirectUrl = (user: User): string => {
    // Post-login redirect logic based on user role/data from Azora Identity
    // This would normally be determined by user preferences stored in Azora Identity
    const preferredDashboard = localStorage.getItem('preferred_dashboard')

    if (preferredDashboard) {
      return `https://${preferredDashboard}.azora.world`
    }

    // Default redirects based on role
    switch (user.role) {
      case 'student':
        return 'https://learn.azora.world'
      case 'developer':
        return 'https://dev.azora.world'
      case 'enterprise':
        return 'https://enterprise.azora.world'
      case 'admin':
        return 'https://admin.azora.world'
      default:
        // Stay on portal for general users or unknown roles
        return window.location.origin
    }
  }

  const login = async () => {
    setIsLoading(true)
    try {
      // In production, redirect to Azora Identity OAuth flow:
      // const AZORA_IDENTITY_URL = process.env.REACT_APP_AZORA_IDENTITY_URL
      // const CLIENT_ID = process.env.REACT_APP_CLIENT_ID
      // const REDIRECT_URI = encodeURIComponent(window.location.origin + '/auth/callback')
      // window.location.href = `${AZORA_IDENTITY_URL}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid profile email`

      // For demo purposes, simulate login with different user types
      const userRole = localStorage.getItem('demo_role') || 'student'

      const mockUsers: Record<string, User> = {
        student: {
          id: 'user_student_123',
          name: 'Alex Johnson',
          email: 'alex@student.azora.world',
          role: 'student',
          trustScore: 85,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
        },
        developer: {
          id: 'user_dev_456',
          name: 'Sarah Chen',
          email: 'sarah@dev.azora.world',
          role: 'developer',
          trustScore: 92,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
        },
        enterprise: {
          id: 'user_enterprise_789',
          name: 'Michael Brown',
          email: 'michael@enterprise.azora.world',
          role: 'enterprise',
          trustScore: 88,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael'
        }
      }

      const mockUser = mockUsers[userRole] || mockUsers.student

      setUser(mockUser)
      localStorage.setItem('azora_user', JSON.stringify(mockUser))
      localStorage.setItem('azora_auth_token', 'mock-jwt-token-' + Date.now())

      // Redirect to appropriate dashboard after successful login
      const redirectUrl = getRedirectUrl(mockUser)
      if (redirectUrl !== window.location.origin) {
        window.location.href = redirectUrl
      }

    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async () => {
    setIsLoading(true)
    try {
      // In production, redirect to Azora Identity registration:
      // const AZORA_IDENTITY_URL = process.env.REACT_APP_AZORA_IDENTITY_URL
      // window.location.href = `${AZORA_IDENTITY_URL}/register?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`

      // For demo, redirect to login (same flow)
      await login()
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // Clear local session
      setUser(null)
      localStorage.removeItem('azora_user')
      localStorage.removeItem('azora_auth_token')
      localStorage.removeItem('preferred_dashboard')

      // In production, also call Azora Identity logout endpoint
      // await fetch(`${AZORA_IDENTITY_URL}/logout`, {
      //   method: 'POST',
      //   credentials: 'include'
      // })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    getRedirectUrl
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}