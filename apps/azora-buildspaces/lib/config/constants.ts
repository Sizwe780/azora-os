/**
 * Application Constants
 * 
 * Centralized constants for the Buildspaces application.
 * Provides consistent values across the application for configuration,
 * limits, timeouts, and other application-wide settings.
 * 
 * Requirements: 3.3
 */

/**
 * Database Configuration Constants
 */
export const DATABASE_CONSTANTS = {
  /** Default connection pool size */
  DEFAULT_POOL_SIZE: 20,
  /** Maximum connection pool size */
  MAX_POOL_SIZE: 50,
  /** Connection timeout in milliseconds */
  CONNECTION_TIMEOUT: 10000,
  /** Query timeout in milliseconds */
  QUERY_TIMEOUT: 30000,
  /** Maximum retry attempts for failed connections */
  MAX_RETRY_ATTEMPTS: 3,
  /** Delay between retry attempts in milliseconds */
  RETRY_DELAY: 1000,
} as const

/**
 * Authentication Configuration Constants
 */
export const AUTH_CONSTANTS = {
  /** Session token expiration time in seconds (30 days) */
  SESSION_MAX_AGE: 30 * 24 * 60 * 60,
  /** JWT token expiration time in seconds (30 days) */
  JWT_MAX_AGE: 30 * 24 * 60 * 60,
  /** Minimum password length */
  MIN_PASSWORD_LENGTH: 8,
  /** Maximum password length */
  MAX_PASSWORD_LENGTH: 128,
  /** Password reset token expiration in milliseconds (1 hour) */
  PASSWORD_RESET_TOKEN_EXPIRY: 60 * 60 * 1000,
  /** Email verification token expiration in milliseconds (24 hours) */
  EMAIL_VERIFICATION_TOKEN_EXPIRY: 24 * 60 * 60 * 1000,
  /** Maximum login attempts before lockout */
  MAX_LOGIN_ATTEMPTS: 5,
  /** Account lockout duration in milliseconds (15 minutes) */
  LOCKOUT_DURATION: 15 * 60 * 1000,
} as const

/**
 * Application Configuration Constants
 */
export const APP_CONSTANTS = {
  /** Application name */
  APP_NAME: 'Azora Buildspaces',
  /** Application version */
  APP_VERSION: '1.0.0',
  /** Default port for development */
  DEFAULT_PORT: 3000,
  /** API request timeout in milliseconds */
  API_TIMEOUT: 30000,
  /** Maximum file upload size in bytes (10MB) */
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024,
  /** Supported file extensions for uploads */
  ALLOWED_FILE_EXTENSIONS: [
    '.js', '.ts', '.jsx', '.tsx',
    '.json', '.md', '.txt',
    '.css', '.scss', '.html',
    '.py', '.java', '.go', '.rs'
  ],
} as const

/**
 * Rate Limiting Constants
 */
export const RATE_LIMIT_CONSTANTS = {
  /** Maximum requests per minute for authentication endpoints */
  AUTH_REQUESTS_PER_MINUTE: 5,
  /** Maximum requests per minute for API endpoints */
  API_REQUESTS_PER_MINUTE: 60,
  /** Maximum requests per minute for file operations */
  FILE_REQUESTS_PER_MINUTE: 30,
  /** Rate limit window in milliseconds */
  RATE_LIMIT_WINDOW: 60 * 1000,
} as const

/**
 * Cache Configuration Constants
 */
export const CACHE_CONSTANTS = {
  /** Default cache TTL in seconds (5 minutes) */
  DEFAULT_TTL: 5 * 60,
  /** Session cache TTL in seconds (30 minutes) */
  SESSION_TTL: 30 * 60,
  /** User data cache TTL in seconds (10 minutes) */
  USER_DATA_TTL: 10 * 60,
  /** Static content cache TTL in seconds (1 hour) */
  STATIC_CONTENT_TTL: 60 * 60,
} as const

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  // Database errors
  DATABASE_NOT_CONFIGURED: 'Database not configured. Set DATABASE_URL in .env.local',
  DATABASE_CONNECTION_FAILED: 'Cannot connect to database. Check DATABASE_URL and ensure PostgreSQL is running',
  PRISMA_CLIENT_NOT_GENERATED: 'Prisma client not generated. Run: pnpm prisma:generate',
  DATABASE_SCHEMA_OUT_OF_SYNC: 'Database schema out of sync. Run: pnpm prisma:migrate',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_SERVICE_UNAVAILABLE: 'Authentication service temporarily unavailable',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  UNAUTHORIZED: 'You must be logged in to access this resource',
  FORBIDDEN: 'You do not have permission to access this resource',
  
  // Validation errors
  INVALID_EMAIL: 'Please provide a valid email address',
  PASSWORD_TOO_SHORT: `Password must be at least ${AUTH_CONSTANTS.MIN_PASSWORD_LENGTH} characters`,
  PASSWORD_TOO_LONG: `Password must not exceed ${AUTH_CONSTANTS.MAX_PASSWORD_LENGTH} characters`,
  WEAK_PASSWORD: 'Password must contain uppercase, lowercase, number, and special character',
  
  // General errors
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later',
  BAD_REQUEST: 'Invalid request. Please check your input',
  NOT_FOUND: 'The requested resource was not found',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
} as const

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  PASSWORD_RESET_SENT: 'Password reset email sent. Please check your inbox',
  PASSWORD_RESET_SUCCESS: 'Password successfully reset',
  EMAIL_VERIFIED: 'Email successfully verified',
  PROFILE_UPDATED: 'Profile successfully updated',
} as const

/**
 * Environment Types
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
  STAGING: 'staging',
} as const

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  GUEST: 'GUEST',
} as const

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

/**
 * Type exports for constants
 */
export type Environment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS]
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS]
