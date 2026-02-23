/**
 * Verification script for the centralized authentication module
 * Tests that all auth components are properly configured and accessible
 */

import { 
  validatePasswordStrength, 
  validateEmail, 
  hashPassword, 
  verifyPassword 
} from '../lib/auth/utils'
import { buildProviders, getEnabledProviders } from '../lib/auth/providers'
import { authOptions, isAuthConfigured } from '../lib/auth/config'

console.log('='.repeat(60))
console.log('Authentication Module Verification')
console.log('='.repeat(60))

// Test 1: Check if auth is configured
console.log('\n1. Authentication Configuration:')
console.log('   Configured:', isAuthConfigured() ? '✓' : '✗')
console.log('   Enabled Providers:', getEnabledProviders().join(', '))

// Test 2: Provider configuration
console.log('\n2. Provider Configuration:')
const providers = buildProviders()
console.log('   Total Providers:', providers.length)
console.log('   Provider IDs:', providers.map((p: any) => p.id || p.name).join(', '))

// Test 3: Environment checks
console.log('\n3. Environment Configuration:')
console.log('   NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Not set')
console.log('   GITHUB_ID:', process.env.GITHUB_ID ? '✓ Set' : '✗ Not set')
console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Not set')

// Test 4: Test utility functions
console.log('\n4. Utility Functions:')

// Email validation
const testEmail = 'test@azora.world'
const invalidEmail = 'invalid-email'
console.log('   Valid email:', validateEmail(testEmail) ? '✓' : '✗')
console.log('   Invalid email rejected:', !validateEmail(invalidEmail) ? '✓' : '✗')

// Password strength validation
const strongPassword = 'Azora2026!'
const weakPassword = 'weak'
const strongValidation = validatePasswordStrength(strongPassword)
const weakValidation = validatePasswordStrength(weakPassword)
console.log('   Strong password accepted:', strongValidation.isValid ? '✓' : '✗')
console.log('   Weak password rejected:', !weakValidation.isValid ? '✓' : '✗')
if (!weakValidation.isValid) {
  console.log('     Reason:', weakValidation.error)
}

// Password hashing and verification
const hashedPassword = hashPassword(strongPassword)
const passwordVerified = verifyPassword(strongPassword, hashedPassword)
const wrongPasswordRejected = !verifyPassword('WrongPassword123!', hashedPassword)
console.log('   Password hash/verify:', passwordVerified ? '✓' : '✗')
console.log('   Wrong password rejected:', wrongPasswordRejected ? '✓' : '✗')

// Test 5: Check authOptions structure
console.log('\n5. NextAuth Configuration:')
console.log('   Has providers:', authOptions.providers.length > 0 ? '✓' : '✗')
console.log('   Has session config:', authOptions.session ? '✓' : '✗')
console.log('   Has callbacks:', authOptions.callbacks ? '✓' : '✗')
console.log('   Has secret:', authOptions.secret ? '✓' : '✗')
console.log('   Session strategy:', (authOptions.session as any)?.strategy || 'N/A')

console.log('\n' + '='.repeat(60))
console.log('Verification Complete')
console.log('='.repeat(60))
