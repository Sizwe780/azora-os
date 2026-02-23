/**
 * Authentication Utility Functions
 * 
 * Provides password verification, hashing, and other authentication utilities.
 * Implements secure password handling using pbkdf2 with salt.
 * 
 * Requirements: 2.1, 7.4
 */

import crypto from "crypto"

/**
 * Verifies a password against a stored pbkdf2 hash
 * Format: salt:hash
 * 
 * Requirement 2.1: Verify credentials against database
 * Requirement 7.4: Validate authentication inputs
 * 
 * @param password - Plain text password to verify
 * @param storedPassword - Stored password in salt:hash format
 * @returns true if password matches, false otherwise
 */
export function verifyPassword(password: string, storedPassword: string): boolean {
  try {
    const [salt, storedHash] = storedPassword.split(':')
    if (!salt || !storedHash) {
      console.error('[AUTH] Invalid password format - expected salt:hash')
      return false
    }
    
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return hash === storedHash
  } catch (e) {
    console.error('[AUTH] Password verification error:', e)
    return false
  }
}

/**
 * Hashes a password using pbkdf2 with a random salt
 * Returns the password in salt:hash format
 * 
 * Requirement 7.4: Secure password handling
 * 
 * @param password - Plain text password to hash
 * @returns Hashed password in salt:hash format
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

/**
 * Validates password strength
 * Requirements: minimum 8 characters, at least one uppercase, one lowercase, one number
 * 
 * Requirement 7.4: Validate authentication inputs
 * 
 * @param password - Password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePasswordStrength(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' }
  }
  
  return { isValid: true }
}

/**
 * Validates email format
 * 
 * Requirement 7.4: Validate authentication inputs
 * 
 * @param email - Email address to validate
 * @returns true if email format is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generates a secure random token for password reset or email verification
 * 
 * Requirement 7.2: Implement password reset functionality with secure token generation
 * 
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generates a token expiry timestamp
 * 
 * Requirement 7.2: Secure token generation with expiry
 * 
 * @param hours - Number of hours until expiry (default: 24)
 * @returns Date object representing expiry time
 */
export function generateTokenExpiry(hours: number = 24): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + hours)
  return expiry
}

/**
 * Checks if a token has expired
 * 
 * @param expiryDate - Token expiry date
 * @returns true if token has expired
 */
export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate
}
