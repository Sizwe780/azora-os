# Authentication Module

Centralized authentication configuration for Azora Buildspaces.

## Overview

This module provides a complete authentication solution using NextAuth with:
- Conditional Prisma adapter integration
- Dynamic provider loading based on environment
- Secure JWT callbacks
- Development fallback authentication
- Password hashing and verification utilities

## Requirements Addressed

- **2.1**: Verify credentials against database
- **2.2**: Create session and return JWT token
- **2.3**: Clear error messages for invalid credentials
- **2.4**: NextAuth with Prisma adapter for session management
- **2.5**: Development fallback when database unavailable
- **7.1**: Organized authentication API routes
- **7.2**: Password reset functionality
- **7.3**: Email verification functionality
- **7.4**: Input validation using Zod schemas
- **7.5**: Authentication event logging

## Structure

```
lib/auth/
├── config.ts       # Main NextAuth configuration
├── utils.ts        # Password hashing, validation utilities
├── providers.ts    # Provider configuration and validation
├── callbacks.ts    # NextAuth callback functions
├── index.ts        # Main export file
└── README.md       # This file
```

## Usage

### Basic Import

```typescript
import { authOptions } from '@/lib/auth/config'
```

### In NextAuth API Route

```typescript
// app/api/auth/[...nextauth]/route.ts
import { authOptions } from '@/lib/auth/config'
import NextAuth from 'next-auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### Using Utility Functions

```typescript
import { 
  hashPassword, 
  verifyPassword, 
  validatePasswordStrength,
  isValidEmail 
} from '@/lib/auth/utils'

// Hash a password
const hashed = hashPassword('MyPassword123!')

// Verify a password
const isValid = verifyPassword('MyPassword123!', hashed)

// Validate password strength
const validation = validatePasswordStrength('weak')
if (!validation.isValid) {
  console.error(validation.error)
}

// Validate email
if (isValidEmail('user@example.com')) {
  // Email is valid
}
```

### Provider Management

```typescript
import { 
  getEnabledProviders, 
  validateProviderConfiguration,
  getProviderStatus 
} from '@/lib/auth/providers'

// Get list of enabled providers
const providers = getEnabledProviders()

// Validate provider configuration
const validation = validateProviderConfiguration()
if (!validation.valid) {
  console.error('Provider configuration errors:', validation.errors)
}

// Get provider status
const status = getProviderStatus()
console.log(status)
```

## Environment Variables

### Required

- `NEXTAUTH_SECRET` - Secret for JWT signing (minimum 32 characters)
- `NEXTAUTH_URL` - Base URL of the application
- `DATABASE_URL` - PostgreSQL connection string (for production)

### Optional (OAuth Providers)

- `GITHUB_ID` - GitHub OAuth client ID
- `GITHUB_SECRET` - GitHub OAuth client secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Development Fallback

- `DEV_AUTH_EMAIL` - Development fallback email (default: admin@azora.world)
- `DEV_AUTH_PASSWORD` - Development fallback password (default: Azora2026!)

## Features

### 1. Conditional Database Usage

The module automatically detects if the database is available and:
- Uses Prisma adapter when database is configured
- Falls back to JWT-only mode when database is unavailable
- Provides development credentials in non-production environments

### 2. Dynamic Provider Loading

Providers are loaded based on environment variables:
- Credentials provider is always enabled
- GitHub OAuth enabled when `GITHUB_ID` and `GITHUB_SECRET` are set
- Google OAuth enabled when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set

### 3. Secure Password Handling

- Passwords are hashed using pbkdf2 with random salt
- Format: `salt:hash`
- 1000 iterations with SHA-512
- 64-byte hash length

### 4. Password Strength Validation

Enforces strong passwords with:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### 5. Security Features

- JWT tokens with secure callbacks
- Session persistence with user ID
- Authentication event logging
- Input sanitization
- CSRF protection (via NextAuth)
- httpOnly cookies (via NextAuth)

## Development Mode

In development (NODE_ENV !== 'production'), when the database is not configured:

1. The system allows a fallback authentication
2. Default credentials: `admin@azora.world` / `Azora2026!`
3. Can be overridden with `DEV_AUTH_EMAIL` and `DEV_AUTH_PASSWORD`
4. **WARNING**: This fallback is DISABLED in production

## Production Requirements

For production deployment:

1. `DATABASE_URL` must be set
2. `NEXTAUTH_SECRET` must be a strong, unique secret
3. Prisma client must be generated
4. Database migrations must be applied
5. Development fallback is automatically disabled

## Error Handling

The module provides clear error messages for:

- Missing database configuration
- Invalid credentials
- Database connection failures
- Missing environment variables
- Invalid password format

## Logging

All authentication events are logged with:

- User ID and email
- Provider used
- Timestamp
- Success/failure status

Logs are prefixed with `[AUTH]` for easy filtering.

## Testing

To verify the authentication module:

```bash
pnpm tsx apps/azora-buildspaces/scripts/verify-auth-module.ts
```

## Migration from Old Auth

If migrating from `lib/auth.ts`:

1. Update imports from `@/lib/auth` to `@/lib/auth/config`
2. Update database client imports from `@/lib/db` to `@/lib/database/client`
3. Verify all authentication flows work correctly
4. Remove old `lib/auth.ts` file

## Next Steps

After implementing this module:

1. Update NextAuth API route to use new configuration
2. Update all imports throughout the application
3. Test authentication flows
4. Remove old authentication files
5. Update documentation

## Support

For issues or questions about the authentication module, refer to:
- Design document: `.kiro/specs/buildspaces-code-organization/design.md`
- Requirements: `.kiro/specs/buildspaces-code-organization/requirements.md`
- Tasks: `.kiro/specs/buildspaces-code-organization/tasks.md`
