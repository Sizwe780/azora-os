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
    console.log('[AuthService] Getting session...');
    const session = await getSession()
    console.log('[AuthService] Session result:', session);

    if (!session || !session.user) {
      console.log('[AuthService] No session found');
      return null
    }

    console.log('[AuthService] Fetching user profile...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const res = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal
      })
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.error('Failed to fetch user profile:', res.status)
        return null
      }

      const userData = await res.json()

      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: new Date(userData.createdAt),
        subscription: {
          plan: userData.subscription.plan,
          status: userData.subscription.status,
          expiresAt: new Date(userData.subscription.expiresAt),
          geographicPricing: userData.subscription.geographicPricing
        },
        verificationStatus: userData.verificationStatus
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
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
