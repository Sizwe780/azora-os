# BuildSpaces Setup Guide

Complete guide for setting up Azora BuildSpaces for local development.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Setup (Automated)](#quick-setup-automated)
- [Manual Setup](#manual-setup)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js 20+**
   ```bash
   node --version  # Should be v20.x or higher
   ```
   
   Install from [nodejs.org](https://nodejs.org/) or use nvm:
   ```bash
   nvm install 20
   nvm use 20
   ```

2. **pnpm 9+**
   ```bash
   pnpm --version  # Should be 9.x or higher
   ```
   
   Install globally:
   ```bash
   npm install -g pnpm@9
   ```

3. **PostgreSQL 14+**
   ```bash
   psql --version  # Should be 14.x or higher
   ```
   
   Install options:
   - **macOS**: `brew install postgresql@14`
   - **Ubuntu/Debian**: `sudo apt install postgresql-14`
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **Cloud**: Use [Supabase](https://supabase.com/) or [Neon](https://neon.tech/)

4. **Git**
   ```bash
   git --version
   ```

### Optional Software

- **Docker** (for containerized services)
- **Redis** (for caching and real-time features)
- **VS Code** (recommended IDE)

---

## Quick Setup (Automated)

The fastest way to get started:

```bash
# 1. Clone the repository (if not already done)
git clone https://github.com/Azora-OS/azora.git
cd azora

# 2. Install dependencies
pnpm install --frozen-lockfile

# 3. Navigate to BuildSpaces
cd apps/azora-buildspaces

# 4. Copy environment template
cp .env.example .env.local

# 5. Edit .env.local with your database credentials
# (See Environment Configuration section below)

# 6. Run automated setup
pnpm setup
```

The setup script will:
- ✅ Verify Node.js and pnpm versions
- ✅ Check for `.env.local` file
- ✅ Validate required environment variables
- ✅ Generate Prisma client
- ✅ Run database migrations
- ✅ Test database connectivity
- ✅ Display setup summary

If successful, you can start the development server:
```bash
pnpm dev
```

---

## Manual Setup

If you prefer step-by-step manual setup:

### 1. Install Dependencies

From the repository root:

```bash
pnpm install --frozen-lockfile
```

This installs all dependencies for the monorepo, including BuildSpaces.

### 2. Configure Environment Variables

```bash
cd apps/azora-buildspaces
cp .env.example .env.local
```

Edit `.env.local` with your configuration (see [Environment Configuration](#environment-configuration)).

### 3. Generate Prisma Client

The Prisma schema is located at the repository root (`prisma/schema.prisma`).

```bash
# From repository root
pnpm prisma:generate

# Or with explicit DATABASE_URL
DATABASE_URL="postgresql://user:pass@localhost:5432/azora_buildspaces" pnpm exec prisma generate
```

This generates the Prisma client in `node_modules/@prisma/client`.

### 4. Run Database Migrations

```bash
# From repository root
pnpm prisma:migrate

# Or with explicit DATABASE_URL
DATABASE_URL="postgresql://user:pass@localhost:5432/azora_buildspaces" pnpm exec prisma migrate dev
```

This creates all required database tables.

### 5. Verify Setup

```bash
cd apps/azora-buildspaces

# Verify Prisma client
pnpm verify:prisma

# Verify environment variables
pnpm verify:env
```

### 6. Start Development Server

```bash
# From repository root
pnpm run dev --filter=azora-buildspaces

# Or from buildspaces directory
cd apps/azora-buildspaces
pnpm dev
```

Access the application at `http://localhost:3002`.

---

## Database Setup

### Option 1: Local PostgreSQL

#### Install PostgreSQL

**macOS (Homebrew)**:
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql-14 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows**:
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/).

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE azora_buildspaces;

# Create user (optional)
CREATE USER azora_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE azora_buildspaces TO azora_user;

# Exit
\q
```

#### Configure DATABASE_URL

In `.env.local`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/azora_buildspaces
```

### Option 2: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name azora-postgres \
  -e POSTGRES_DB=azora_buildspaces \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
```

Configure DATABASE_URL:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/azora_buildspaces
```

### Option 3: Cloud Database (Supabase/Neon)

#### Supabase

1. Create account at [supabase.com](https://supabase.com/)
2. Create new project
3. Get connection string from Settings → Database
4. Use the "Connection pooling" URL for better performance

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
```

#### Neon

1. Create account at [neon.tech](https://neon.tech/)
2. Create new project
3. Copy connection string

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

---

## Environment Configuration

### Minimal Configuration

The absolute minimum to run BuildSpaces:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/azora_buildspaces

# Authentication
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3002

# Application
NODE_ENV=development
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Recommended Configuration

For full functionality, add:

```env
# AI Providers (at least one)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Real-time features
REDIS_URL=redis://localhost:6379

# Design Studio
FIGMA_TOKEN=figd_...
NEXT_PUBLIC_FIGMA_ENABLED=true

# GitHub integration
GITHUB_TOKEN=ghp_...
```

### Full Configuration

See `.env.example` for all available options.

---

## Verification

### 1. Check Health Endpoint

```bash
curl http://localhost:3002/api/health
```

Expected response:
```json
{
  "ok": true,
  "status": "healthy",
  "checks": {
    "database": {
      "status": "connected"
    }
  }
}
```

### 2. Verify Prisma Client

```bash
pnpm verify:prisma
```

Should output:
```
✅ Prisma client is generated
✅ Database connection successful
✅ Schema is in sync
```

### 3. Verify Environment Variables

```bash
pnpm verify:env
```

Should output:
```
✅ All required environment variables are set
✅ DATABASE_URL is valid
✅ NEXTAUTH_SECRET is set
```

### 4. Test Authentication

1. Navigate to `http://localhost:3002`
2. Try logging in with dev credentials:
   - Email: `admin@azora.world`
   - Password: `Azora2026!`

Note: Dev credentials only work when `NODE_ENV !== production`.

---

## Troubleshooting

### Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
pnpm prisma:generate
pnpm verify:prisma
```

### Database Connection Failed

**Error**: `Can't reach database server`

**Solutions**:

1. **Check PostgreSQL is running**:
   ```bash
   pg_isready
   # Or
   sudo systemctl status postgresql  # Linux
   brew services list | grep postgresql  # macOS
   ```

2. **Verify DATABASE_URL format**:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

3. **Test connection manually**:
   ```bash
   psql -h localhost -U postgres -d azora_buildspaces
   ```

4. **Check firewall/network**:
   - Ensure port 5432 is open
   - Check PostgreSQL accepts connections

### Schema Out of Sync

**Error**: `Invalid prisma.table.findMany() invocation`

**Solution**:
```bash
# Run migrations
pnpm prisma:migrate

# Or reset database (⚠️ deletes all data)
DATABASE_URL="..." pnpm exec prisma migrate reset

# Regenerate client
pnpm prisma:generate
```

### Port Already in Use

**Error**: `Port 3002 is already in use`

**Solution**:
```bash
# Find process
lsof -i :3002  # macOS/Linux
netstat -ano | findstr :3002  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3003 pnpm dev
```

### Module Not Found

**Error**: `Cannot find module 'X'`

**Solution**:
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install --frozen-lockfile

# Clear Next.js cache
rm -rf .next
pnpm dev
```

### Import Errors After Reorganization

**Error**: `Module not found: Can't resolve 'lib/db'`

**Solution**: Update imports to new structure:

```typescript
// ❌ Old (deprecated)
import { prisma } from 'lib/db'
import { authOptions } from 'lib/auth'

// ✅ New (current)
import { prisma } from 'lib/database/client'
import { authOptions } from 'lib/auth/config'
```

Run verification:
```bash
pnpm verify:auth-imports
```

---

## Next Steps

After successful setup:

1. **Explore the application**:
   - Visit `http://localhost:3002`
   - Try different rooms (Code Chamber, Spec Chamber, etc.)

2. **Read the documentation**:
   - [README.md](./README.md) - Overview and features
   - [CODE_ORGANIZATION.md](./CODE_ORGANIZATION.md) - Code structure
   - [API Documentation](./docs/API.md) - API endpoints

3. **Start developing**:
   - Create a new room
   - Add a new API endpoint
   - Extend existing features

4. **Run tests**:
   ```bash
   pnpm test
   pnpm test:coverage
   ```

5. **Deploy**:
   - See [Deployment Guide](./README.md#-deployment-options)

---

## Getting Help

If you encounter issues not covered here:

1. Check the [Troubleshooting section in README](./README.md#-troubleshooting)
2. Review [Database Guide](../../docs/DATABASE-GUIDE.md)
3. Check [Security Guide](../../docs/SECURITY.md)
4. Report an issue with:
   - Error messages
   - Relevant logs
   - Environment details
   - Steps to reproduce

---

**Last Updated**: January 2026  
**Status**: Production Ready  
**Version**: 0.1.0
