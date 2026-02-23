# Design Document

## Overview

This design addresses the code organization and database connectivity issues in Azora Buildspaces. The solution consolidates duplicate database client implementations, establishes a clear authentication flow, and organizes the codebase for maintainability. The design prioritizes minimal changes while maximizing impact on code quality and functionality.

## Architecture

### High-Level Structure

```
apps/azora-buildspaces/
├── lib/
│   ├── database/
│   │   ├── client.ts          # Single source of truth for Prisma client
│   │   ├── types.ts           # Database type exports
│   │   └── utils.ts           # Database utility functions
│   ├── auth/
│   │   ├── config.ts          # NextAuth configuration
│   │   ├── providers.ts       # Auth provider configurations
│   │   ├── callbacks.ts       # NextAuth callbacks
│   │   └── utils.ts           # Auth utility functions
│   ├── config/
│   │   ├── env.ts             # Environment variable validation
│   │   └── constants.ts       # Application constants
│   └── utils.ts               # General utilities
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts   # NextAuth API route
└── scripts/
    ├── setup.ts               # Development setup script
    └── verify-prisma.ts       # Prisma verification script
```

## Components and Interfaces

### 1. Database Client Module (`lib/database/client.ts`)

**Purpose**: Provide a single, properly configured Prisma client instance for the entire application.

**Key Features**:
- Singleton pattern to prevent multiple client instances
- Graceful degradation with clear error messages
- Prisma v7 adapter configuration for PostgreSQL
- Connection pooling configuration
- Development vs production behavior

**Interface**:
```typescript
export const prisma: PrismaClient | ProxyClient
export const PRISMA_AVAILABLE: boolean
export function isPrismaConfigured(): boolean
export function getDatabaseStatus(): DatabaseStatus
```

**Implementation Strategy**:
1. Attempt to load `@prisma/client` with try-catch
2. Check for DATABASE_URL environment variable
3. If both available, create PrismaClient with PrismaPg adapter
4. If unavailable, return error-throwing proxy in production
5. In development, provide helpful error messages with setup instructions

### 2. Authentication Configuration Module (`lib/auth/config.ts`)

**Purpose**: Centralize NextAuth configuration with proper Prisma adapter integration.

**Key Features**:
- Dynamic provider loading based on environment variables
- Conditional Prisma adapter usage
- JWT strategy with session callbacks
- Development fallback authentication
- Security-first configuration

**Interface**:
```typescript
export const authOptions: NextAuthOptions
export function getAuthProviders(): Provider[]
export function isAuthConfigured(): boolean
```

**Implementation Strategy**:
1. Import database client from centralized location
2. Conditionally enable Prisma adapter only when database is available
3. Always include credentials provider with database fallback
4. Add OAuth providers (GitHub, Google) when credentials are configured
5. Implement secure JWT callbacks for session management

### 3. Environment Configuration Module (`lib/config/env.ts`)

**Purpose**: Validate and provide type-safe access to environment variables.

**Key Features**:
- Zod schema validation for all environment variables
- Clear error messages for missing required variables
- Type-safe environment variable access
- Development vs production requirements

**Interface**:
```typescript
export const env: {
  DATABASE_URL: string | undefined
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
  // ... other env vars
}
export function validateEnvironment(): ValidationResult
```

### 4. Setup Script (`scripts/setup.ts`)

**Purpose**: Automate the development environment setup process.

**Key Features**:
- Check for required dependencies
- Verify environment variables
- Generate Prisma client
- Run database migrations
- Seed initial data
- Provide clear success/failure feedback

**Workflow**:
```
1. Check Node.js version
2. Verify pnpm installation
3. Check for .env.local file
4. Validate required environment variables
5. Run: pnpm prisma:generate
6. Run: pnpm prisma:migrate
7. Optionally run: pnpm seed:admin
8. Display setup summary
```

## Data Models

### Database Connection Status

```typescript
interface DatabaseStatus {
  configured: boolean
  connected: boolean
  clientGenerated: boolean
  error?: string
  message: string
}
```

### Authentication Session

```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
  }
  expires: string
}
```

### Environment Configuration

```typescript
interface EnvironmentConfig {
  database: {
    url?: string
    poolSize: number
  }
  auth: {
    secret: string
    url: string
    providers: {
      github?: { id: string; secret: string }
      google?: { id: string; secret: string }
    }
  }
  app: {
    port: number
    env: 'development' | 'production' | 'test'
  }
}
```

## Error Handling

### Database Errors

**Strategy**: Fail fast with clear, actionable error messages.

**Error Types**:
1. **Configuration Error**: DATABASE_URL not set
   - Message: "Database not configured. Set DATABASE_URL in .env.local"
   - Action: Provide setup instructions

2. **Client Generation Error**: Prisma client not generated
   - Message: "Prisma client not generated. Run: pnpm prisma:generate"
   - Action: Show generation command

3. **Connection Error**: Cannot connect to database
   - Message: "Cannot connect to database. Check DATABASE_URL and ensure PostgreSQL is running"
   - Action: Provide troubleshooting steps

4. **Migration Error**: Database schema out of sync
   - Message: "Database schema out of sync. Run: pnpm prisma:migrate"
   - Action: Show migration command

### Authentication Errors

**Strategy**: Secure error messages that don't leak sensitive information.

**Error Types**:
1. **Invalid Credentials**: Wrong email/password
   - Message: "Invalid email or password"
   - Log: Detailed error for debugging

2. **Database Unavailable**: Cannot verify credentials
   - Message: "Authentication service temporarily unavailable"
   - Log: Database connection error

3. **Session Error**: Invalid or expired session
   - Message: "Your session has expired. Please log in again"
   - Action: Redirect to login

## Testing Strategy

### Unit Tests

**Database Client**:
- Test client initialization with valid DATABASE_URL
- Test client initialization without DATABASE_URL
- Test proxy behavior when client not generated
- Test connection status reporting

**Authentication**:
- Test credential validation with valid user
- Test credential validation with invalid user
- Test development fallback authentication
- Test JWT token generation and validation
- Test session callbacks

**Environment Configuration**:
- Test validation with complete environment
- Test validation with missing required variables
- Test validation with invalid variable formats

### Integration Tests

**Database Operations**:
- Test user creation and retrieval
- Test transaction handling
- Test connection pooling
- Test error recovery

**Authentication Flow**:
- Test complete login flow with database
- Test login flow without database (dev mode)
- Test session persistence
- Test logout flow

### End-to-End Tests

**User Journey**:
1. User visits login page
2. User enters credentials
3. System validates against database
4. System creates session
5. User accesses protected route
6. System validates session
7. User logs out

## Migration Plan

### Phase 1: Create New Database Module
1. Create `lib/database/client.ts` with consolidated logic
2. Export both `prisma` and `PRISMA_AVAILABLE`
3. Add comprehensive error handling
4. Add database status utilities

### Phase 2: Create New Auth Module
1. Create `lib/auth/config.ts`
2. Move auth configuration from `lib/auth.ts`
3. Import database client from new location
4. Add provider configuration logic

### Phase 3: Update Imports
1. Find all imports of `lib/db.ts` and `lib/prisma.ts`
2. Update to import from `lib/database/client.ts`
3. Verify no breaking changes

### Phase 4: Remove Duplicates
1. Delete `lib/db.ts`
2. Delete `lib/prisma.ts`
3. Update any remaining references

### Phase 5: Add Setup Tooling
1. Create setup script
2. Create verification script
3. Update package.json scripts
4. Update documentation

### Phase 6: Testing
1. Run unit tests
2. Run integration tests
3. Test manual login flow
4. Test with and without database

## Security Considerations

### Database Security
- Use connection pooling to prevent connection exhaustion
- Never log DATABASE_URL or connection strings
- Use parameterized queries (Prisma handles this)
- Implement connection timeout limits

### Authentication Security
- Use secure JWT secret (minimum 32 characters)
- Implement CSRF protection (NextAuth handles this)
- Use httpOnly cookies for session tokens
- Implement rate limiting on auth endpoints
- Hash passwords with strong algorithm (pbkdf2 with salt)
- Never log passwords or tokens

### Environment Security
- Never commit .env.local to version control
- Validate all environment variables on startup
- Use different secrets for dev/staging/production
- Rotate secrets regularly

## Performance Considerations

### Database Performance
- Use connection pooling (default: 20 connections)
- Implement query result caching where appropriate
- Use database indexes for frequently queried fields
- Monitor slow queries in development

### Authentication Performance
- Use JWT strategy to avoid database lookups on every request
- Implement session caching
- Set appropriate session expiration times
- Use Redis for session storage in production (future enhancement)

## Deployment Considerations

### Environment Setup
1. Set all required environment variables
2. Generate Prisma client: `pnpm prisma:generate`
3. Run migrations: `pnpm prisma:migrate`
4. Seed initial data if needed
5. Verify database connectivity
6. Start application

### Health Checks
- Implement `/api/health` endpoint
- Check database connectivity
- Check Prisma client availability
- Return appropriate status codes

### Monitoring
- Log all authentication attempts
- Log database connection errors
- Monitor connection pool usage
- Track query performance
- Alert on repeated authentication failures

## Documentation Updates

### README.md
- Add setup instructions
- Document environment variables
- Add troubleshooting section
- Include common error solutions

### CONTRIBUTING.md
- Document code organization standards
- Explain database client usage
- Explain authentication flow
- Add testing guidelines

### API Documentation
- Document authentication endpoints
- Document error responses
- Provide example requests/responses
- Include authentication requirements
