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

  private constructor() { }

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

    // In a client-side service, we should rely on the session data
    // or fetch additional details from an API route if needed.
    // We cannot import Prisma here as this code runs in the browser.

    return {
      id: (session.user as any).id || 'unknown',
      name: session.user.name || 'User',
      email: session.user.email || '',
      createdAt: new Date(), // Session doesn't have this, would need API fetch
      subscription: {
        plan: 'constitutional',
        status: 'trial',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

  async signup(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        return { success: false, error: json.error || 'Signup failed' }
      }

      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async logout(): Promise<void> {
    await signOut({ redirect: false })
  }
}
