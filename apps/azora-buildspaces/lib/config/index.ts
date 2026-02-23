/**
 * Configuration Module - Main Export Point
 * 
 * Centralized exports for all configuration-related functionality.
 * Provides a clean API for application constants, environment configuration,
 * and other configuration utilities.
 * 
 * Requirements: 3.3
 * 
 * @example
 * ```typescript
 * // Import constants
 * import { AUTH_CONSTANTS, ERROR_MESSAGES, HTTP_STATUS } from '@/lib/config'
 * 
 * // Use constants in your code
 * const sessionMaxAge = AUTH_CONSTANTS.SESSION_MAX_AGE
 * 
 * // Use error messages
 * throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS)
 * 
 * // Use HTTP status codes
 * return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.UNAUTHORIZED })
 * ```
 */

// Export all constants
export {
  DATABASE_CONSTANTS,
  AUTH_CONSTANTS,
  APP_CONSTANTS,
  RATE_LIMIT_CONSTANTS,
  CACHE_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ENVIRONMENTS,
  USER_ROLES,
  HTTP_STATUS,
} from './constants'

// Export types
export type {
  Environment,
  UserRole,
  HttpStatus,
} from './constants'

// Environment configuration with Zod validation
export {
  env,
  isEnvValid,
  getEnvErrors,
  getEnvErrorMessage,
  features,
  rooms,
} from './env'
