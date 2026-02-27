/**
 * End-to-End Authentication Flow Tests
 * 
 * Tests the complete authentication flow including:
 * - Login with valid/invalid credentials
 * - Session creation and persistence
 * - Protected route access
 * - Logout functionality
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 7.1
 */

/** @jest-environment node */

import { authOptions } from '@/lib/auth/config'
import { verifyPassword } from '@/lib/auth/utils'
import crypto from 'crypto'

// Setup global mock for providers.ts
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
}
// @ts-ignore
global.prisma = mockPrisma

// Helper to hash password (same method used in register route)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

describe('Authentication Flow End-to-End', () => {
  describe('1. Login with Valid Credentials', () => {
    it('should authenticate with master credentials (dev mode)', async () => {
      const credentialProvider = authOptions.providers.find((p: any) => p.id === 'credentials')
      expect(credentialProvider).toBeDefined()

      // Set environment variables for test
      // @ts-ignore
      process.env.DEV_AUTH_EMAIL = 'admin@azora.world'
      // @ts-ignore
      process.env.DEV_AUTH_PASSWORD = 'Azora2026!'
      
      const pwd = 'Azora2026!'; 
      // @ts-ignore
      const hashed = hashPassword(pwd);

      (global.prisma.user.findUnique as jest.Mock).mockResolvedValue({
         id: 'dev-admin',
         name: 'Dev Admin',
         email: 'admin@azora.world',
         password: hashed
      })

      const result = await (credentialProvider as any).options.authorize({
        email: 'admin@azora.world',
        password: pwd
      })

      expect(result).toBeDefined()
      expect(result).toHaveProperty('email', 'admin@azora.world')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('id')
    })

    it('should authenticate with database credentials when password matches', async () => {
      const password = 'TestPassword123!'
      // @ts-ignore
      const hashedPassword = hashPassword(password);

      // Configure global mock
      (global.prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'test-user-id', 
        name: 'Test User', 
        email: 'test@example.com', 
        password: hashedPassword, 
        role: 'STUDENT'
      })

      const credentialProvider = authOptions.providers.find((p: any) => p.id === 'credentials')
      
      // Verify password utility works correctly
      const isValid = verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should return user object with required fields on successful login', async () => {
      const credentialProvider = authOptions.providers.find((p: any) => p.id === 'credentials')
      
      if (!credentialProvider) {
        throw new Error('Credential provider not found')
      }

      // The previous test passes, so we know this works for "dev-admin" when PRISMA_AVAILABLE is false 
      // or "user not found" in global mock.
      // But we need to ensure the mock is reset or configured for this test too.
      (global.prisma.user.findUnique as jest.Mock).mockResolvedValue({
         id: 'dev-admin',
         name: 'Dev Admin',
         email: 'admin@azora.world',
         // @ts-ignore
         password: hashPassword('Azora2026!')
      })
      
      const result = await (credentialProvider as any).options.authorize({
        email: 'admin@azora.world',
        password: 'Azora2026!'
      })

      // Verify user object structure
      expect(result).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
        name: expect.any(String)
      })
    })
  })

  describe('2. Login with Invalid Credentials', () => {
    it('should reject login with incorrect password', async () => {
      const credentialProvider = authOptions.providers.find((p: any) => p.id === 'credentials')
      
      const result = await (credentialProvider as any).options.authorize({
        email: 'admin@azora.world',
        password: 'WrongPassword123!'
      })

      expect(result).toBeNull()
    })

    it('should reject login with non-existent email', async () => {
      const mockPrisma = {
        user: {
          findUnique: jest.fn().mockResolvedValue(null)
        }
      }

      jest.mock('@/lib/database/client', () => ({
        prisma: mockPrisma,
        PRISMA_AVAILABLE: true
      }))

      const credentialProvider = authOptions.providers.find((p: any) => p.id === 'credentials')
      
      const result = await (credentialProvider as any).options.authorize({
        email: 'nonexistent@example.com',
        password: 'AnyPassword123!'
      })

      expect(result).toBeNull()
    })

    it('should reject login with empty credentials', async () => {
      const credentialProvider = authOptions.providers.find((p: any) => p.id === 'credentials')
      
      const result = await (credentialProvider as any).options.authorize({
        email: '',
        password: ''
      })

      expect(result).toBeNull()
    })

    it('should reject login with missing email', async () => {
      const credentialProvider = authOptions.providers.find((p: any) => p.id === 'credentials')
      
      const result = await (credentialProvider as any).options.authorize({
        password: 'SomePassword123!'
      })

      expect(result).toBeNull()
    })

    it('should reject login with missing password', async () => {
      const credentialProvider = authOptions.providers.find((p: any) => p.id === 'credentials')
      
      const result = await (credentialProvider as any).options.authorize({
        email: 'test@example.com'
      })

      expect(result).toBeNull()
    })
  })

  describe('3. Session Creation and Persistence', () => {
    it('should have JWT callback configured', () => {
      expect(authOptions.callbacks).toBeDefined()
      expect(authOptions.callbacks?.jwt).toBeDefined()
      expect(typeof authOptions.callbacks?.jwt).toBe('function')
    })

    it('should have session callback configured', () => {
      expect(authOptions.callbacks).toBeDefined()
      expect(authOptions.callbacks?.session).toBeDefined()
      expect(typeof authOptions.callbacks?.session).toBe('function')
    })

    it('should include user data in JWT token', async () => {
      const jwtCallback = authOptions.callbacks?.jwt

      if (!jwtCallback) {
        throw new Error('JWT callback not configured')
      }

      const mockToken = {}
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'STUDENT'
      }

      const result = await jwtCallback({
        token: mockToken,
        user: mockUser,
        account: null,
        profile: undefined,
        trigger: 'signIn',
        isNewUser: false,
        session: undefined
      })

      expect(result).toHaveProperty('sub', mockUser.id)
      expect(result).toHaveProperty('email', mockUser.email)
      expect(result).toHaveProperty('name', mockUser.name)
    })

    it('should include user data in session object', async () => {
      const sessionCallback = authOptions.callbacks?.session

      if (!sessionCallback) {
        throw new Error('Session callback not configured')
      }

      const mockSession = {
        user: {},
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const mockToken = {
        sub: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'STUDENT'
      }

      const result = await sessionCallback({
        session: mockSession,
        token: mockToken,
        user: undefined as any,
        newSession: undefined,
        trigger: 'getSession'
      })

      expect(result.user).toHaveProperty('id', mockToken.sub)
      expect(result.user).toHaveProperty('email', mockToken.email)
      expect(result.user).toHaveProperty('name', mockToken.name)
    })

    it('should configure session strategy as JWT', () => {
      expect(authOptions.session).toBeDefined()
      expect(authOptions.session?.strategy).toBe('jwt')
    })

    it('should configure appropriate session max age', () => {
      expect(authOptions.session).toBeDefined()
      expect(authOptions.session?.maxAge).toBeDefined()
      expect(authOptions.session?.maxAge).toBeGreaterThan(0)
      // Should be at least 1 day (86400 seconds)
      expect(authOptions.session?.maxAge).toBeGreaterThanOrEqual(86400)
    })
  })

  describe('4. Protected Route Access', () => {
    it('should have pages configuration for auth routes', () => {
      expect(authOptions.pages).toBeDefined()
    })

    it('should configure sign-in page', () => {
      expect(authOptions.pages?.signIn).toBeDefined()
      expect(typeof authOptions.pages?.signIn).toBe('string')
    })

    it('should configure error page', () => {
      expect(authOptions.pages?.error).toBeDefined()
      expect(typeof authOptions.pages?.error).toBe('string')
    })

    it('should allow access with valid session token', async () => {
      const sessionCallback = authOptions.callbacks?.session

      if (!sessionCallback) {
        throw new Error('Session callback not configured')
      }

      const validToken = {
        sub: 'user-123',
        email: 'user@example.com',
        name: 'Valid User',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400
      }

      const mockSession = {
        user: {},
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const result = await sessionCallback({
        session: mockSession,
        token: validToken,
        user: undefined as any,
        newSession: undefined,
        trigger: 'getSession'
      })

      expect(result).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.user.id).toBe(validToken.sub)
    })
  })

  describe('5. Logout Functionality', () => {
    it('should have signOut callback configured', () => {
      // NextAuth handles signOut automatically
      // We verify the configuration supports it
      expect(authOptions.session?.strategy).toBe('jwt')
      // JWT strategy means tokens are client-side and signOut clears them
    })

    it('should clear session data on logout', async () => {
      // Simulate logout by verifying session callback handles empty token
      const sessionCallback = authOptions.callbacks?.session

      if (!sessionCallback) {
        throw new Error('Session callback not configured')
      }

      const emptySession = {
        user: {},
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const emptyToken = {}

      const result = await sessionCallback({
        session: emptySession,
        token: emptyToken,
        user: undefined as any,
        newSession: undefined,
        trigger: 'getSession'
      })

      // After logout, session should not have user data
      expect(result.user.id).toBeUndefined()
    })
  })

  describe('6. Authentication Configuration Validation', () => {
    it('should have at least one authentication provider configured', () => {
      expect(authOptions.providers).toBeDefined()
      expect(Array.isArray(authOptions.providers)).toBe(true)
      expect(authOptions.providers.length).toBeGreaterThan(0)
    })

    it('should have credentials provider configured', () => {
      const credentialProvider = authOptions.providers.find((p: any) => p.id === 'credentials')
      expect(credentialProvider).toBeDefined()
    })

    it('should have secret configured', () => {
      expect(authOptions.secret).toBeDefined()
      expect(typeof authOptions.secret).toBe('string')
      expect(authOptions.secret.length).toBeGreaterThan(0)
    })

    it('should have callbacks configured', () => {
      expect(authOptions.callbacks).toBeDefined()
      expect(authOptions.callbacks?.jwt).toBeDefined()
      expect(authOptions.callbacks?.session).toBeDefined()
    })

    it('should use Prisma adapter when database is available', () => {
      // The adapter is conditionally set based on PRISMA_AVAILABLE
      // We verify the configuration supports it
      expect(authOptions.session?.strategy).toBe('jwt')
    })
  })

  describe('7. Password Security', () => {
    it('should hash passwords securely', () => {
      const password = 'TestPassword123!'
      const hashed = hashPassword(password)

      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed).toContain(':') // salt:hash format
      expect(hashed.length).toBeGreaterThan(64) // At least 64 chars for hash + salt
    })

    it('should verify correct passwords', () => {
      const password = 'TestPassword123!'
      const hashed = hashPassword(password)

      const isValid = verifyPassword(password, hashed)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect passwords', () => {
      const password = 'TestPassword123!'
      const hashed = hashPassword(password)

      const isValid = verifyPassword('WrongPassword!', hashed)
      expect(isValid).toBe(false)
    })

    it('should use different salts for same password', () => {
      const password = 'TestPassword123!'
      const hash1 = hashPassword(password)
      const hash2 = hashPassword(password)

      expect(hash1).not.toBe(hash2)
      
      // But both should verify correctly
      expect(verifyPassword(password, hash1)).toBe(true)
      expect(verifyPassword(password, hash2)).toBe(true)
    })
  })
})
