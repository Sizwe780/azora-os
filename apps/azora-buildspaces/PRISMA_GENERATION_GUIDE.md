# Prisma Client Generation Guide

This guide explains how to generate and verify the Prisma client for Azora Buildspaces.

## Overview

The Prisma client is an auto-generated database client that provides type-safe database access. It must be generated from the Prisma schema before the application can connect to the database.

## Requirements

This guide addresses the following requirements:
- **1.1**: Prisma client is properly generated
- **1.2**: Client is available in node_modules/@prisma/client
- **1.5**: Client is available to all application modules
- **5.3**: Clear instructions for Prisma client generation

## Prerequisites

1. Node.js >= 20
2. pnpm package manager
3. PostgreSQL database (for connection testing)

## Step-by-Step Instructions

### 1. Install Dependencies

First, ensure all dependencies are installed:

```bash
# From workspace root
pnpm install
```

This will install:
- `prisma` CLI tool (devDependency)
- `@prisma/client` package
- `@prisma/adapter-pg` for Prisma v7 PostgreSQL adapter

### 2. Generate Prisma Client

Generate the Prisma client from the schema:

```bash
# From apps/azora-buildspaces directory
pnpm prisma:generate
```

Or from workspace root:

```bash
pnpm -w exec prisma generate --schema=prisma/schema.prisma
```

This command:
- Reads the Prisma schema from `prisma/schema.prisma`
- Generates TypeScript types based on your models
- Creates the Prisma client in `node_modules/@prisma/client`
- Enables type-safe database queries

### 3. Verify Generation

Run the verification script to ensure everything is set up correctly:

```bash
# From apps/azora-buildspaces directory
pnpm verify:prisma:generation
```

This script checks:
- ✅ Prisma CLI is installed
- ✅ @prisma/client is generated
- ✅ Prisma schema exists
- ✅ Database client can be imported
- ✅ Database connection works (if DATABASE_URL is set)

### 4. Configure Database (Optional)

To test database connectivity:

1. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

2. Set your DATABASE_URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/azora_buildspaces"
   ```

3. Run migrations:
   ```bash
   pnpm prisma:migrate
   ```

## Verification Checklist

Use this checklist to verify Prisma client generation:

- [ ] Dependencies installed (`node_modules` exists)
- [ ] Prisma CLI available (`node_modules/.bin/prisma`)
- [ ] @prisma/client generated (`node_modules/@prisma/client/index.js` exists)
- [ ] Database client imports successfully
- [ ] `PRISMA_AVAILABLE` flag is exported
- [ ] Database connection works (if DATABASE_URL is set)

## Common Issues and Solutions

### Issue: "Prisma client not generated"

**Solution:**
```bash
pnpm prisma:generate
```

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```bash
# Reinstall dependencies and regenerate
pnpm install
pnpm prisma:generate
```

### Issue: "Database connection failed"

**Possible causes:**
1. DATABASE_URL not set in .env.local
2. PostgreSQL server not running
3. Incorrect database credentials
4. Database doesn't exist

**Solution:**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Verify PostgreSQL is running
# On Windows: Check Services for PostgreSQL
# On Linux/Mac: sudo systemctl status postgresql

# Create database if needed
createdb azora_buildspaces

# Run migrations
pnpm prisma:migrate
```

### Issue: "Prisma schema not found"

**Solution:**
The schema should be at `prisma/schema.prisma` in the workspace root. If it's missing, restore it from version control.

## How It Works

### Prisma Client Architecture

```
prisma/schema.prisma (Source)
        ↓
    [prisma generate]
        ↓
node_modules/@prisma/client (Generated)
        ↓
lib/database/client.ts (Wrapper)
        ↓
Application Code (Usage)
```

### Database Client Module

The centralized database client is located at `lib/database/client.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Singleton instance
export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  // ... configuration
});

// Availability flag
export const PRISMA_AVAILABLE = true;
```

### Usage in Application

Import the client from the centralized location:

```typescript
import { prisma, PRISMA_AVAILABLE } from '@/lib/database/client';

// Check availability
if (PRISMA_AVAILABLE) {
  const users = await prisma.user.findMany();
}
```

## Scripts Reference

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Generate | `pnpm prisma:generate` | Generate Prisma client from schema |
| Migrate | `pnpm prisma:migrate` | Run database migrations |
| Verify | `pnpm verify:prisma:generation` | Verify client generation |
| Setup | `pnpm setup` | Complete development setup |

### Script Locations

- `scripts/verify-prisma-generation.ts` - Verification script
- `scripts/setup.ts` - Complete setup automation
- `scripts/verify-prisma.ts` - Prisma-specific verification

## Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# 4. Generate Prisma client
pnpm prisma:generate

# 5. Run migrations
pnpm prisma:migrate

# 6. Verify setup
pnpm verify:prisma:generation

# 7. Start development server
pnpm dev
```

### After Schema Changes

Whenever you modify `prisma/schema.prisma`:

```bash
# 1. Generate new client
pnpm prisma:generate

# 2. Create migration
pnpm prisma migrate dev --name describe_your_changes

# 3. Verify generation
pnpm verify:prisma:generation
```

## Testing

### Manual Testing

Test the Prisma client manually:

```typescript
// test-prisma.ts
import { prisma } from './lib/database/client';

async function test() {
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
```

Run with:
```bash
tsx test-prisma.ts
```

### Automated Testing

The verification script runs automatically:

```bash
pnpm verify:prisma:generation
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Dependencies installed in production
- [ ] Prisma client generated
- [ ] DATABASE_URL configured
- [ ] Migrations applied
- [ ] Connection pooling configured
- [ ] Error handling tested

### Deployment Commands

```bash
# 1. Install production dependencies
pnpm install --prod

# 2. Generate Prisma client
pnpm prisma:generate

# 3. Run migrations
pnpm prisma:migrate deploy

# 4. Verify setup
pnpm verify:prisma:generation

# 5. Start application
pnpm start
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma v7 Migration Guide](https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [PostgreSQL Adapter Documentation](https://www.prisma.io/docs/orm/overview/databases/postgresql)
- [Buildspaces Setup Guide](./SETUP.md)
- [Code Organization Guide](./CODE_ORGANIZATION.md)

## Support

If you encounter issues not covered in this guide:

1. Check the [troubleshooting section](#common-issues-and-solutions)
2. Run the verification script for detailed diagnostics
3. Review the Prisma logs in the console
4. Check the database connection settings
5. Consult the team or create an issue

## Changelog

### 2026-02-19
- Initial version created
- Added comprehensive verification script
- Documented all generation steps
- Added troubleshooting guide
