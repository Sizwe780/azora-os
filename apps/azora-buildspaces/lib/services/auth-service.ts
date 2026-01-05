import { getSession, signOut } from "next-auth/react"

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  subscription?: {
    plan: 'constitutional' | 'ubuntu_pro' | 'citadel_enterprise'
    status: 'trial' | 'active' | 'expired' | 'cancelled'
    expiresAt: string | Date
    geographicPricing?: {
      country: string
      discount: number
    }
  }
  verificationStatus?: {
    email: boolean
    identity: boolean
    student?: boolean
  }
}

export class AuthService {
  private static instance: AuthService

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await getSession()
    
    if (!session || !session.user) {
      return null
    }

    // Return a mock user based on the session for now
    // In a real app, this would fetch from a database
    return {
      id: (session.user as any).id || 'mock-id',
      name: session.user.name || 'User',
      email: session.user.email || '',
      createdAt: new Date(),
      subscription: {
        plan: 'constitutional',
        status: 'trial',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        geographicPricing: {
          country: 'Global',
          discount: 0
        }
      },
      verificationStatus: {
        email: true,
        identity: false
      }
    }
  }

  async logout(): Promise<void> {
    await signOut({ redirect: false })
  }
}
