#!/usr/bin/env tsx
/**
 * Prisma Verification Script
 * 
 * This script verifies that Prisma is properly configured and the database is accessible.
 * It checks client generation, schema validity, and database connectivity.
 * 
 * Requirements: 5.1, 5.3, 5.4, 5.5
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface VerificationResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

class PrismaVerifier {
  private results: VerificationResult[] = [];
  private hasErrors = false;

  private addResult(result: VerificationResult) {
    this.results.push(result);
    if (result.status === 'fail') {
      this.hasErrors = true;
    }
  }

  private getStatusIcon(status: 'pass' | 'fail' | 'warning'): string {
    switch (status) {
      case 'pass': return '✓';
      case 'fail': return '✗';
      case 'warning': return '⚠';
    }
  }

  public verifySchemaExists(): void {
    const schemaPath = join(process.cwd(), '../../prisma/schema.prisma');
    
    if (!existsSync(schemaPath)) {
      this.addResult({
        name: 'Prisma Schema',
        status: 'fail',
        message: 'Schema file not found',
        details: `Expected location: ${schemaPath}`
      });
      return;
    }

    this.addResult({
      name: 'Prisma Schema',
      status: 'pass',
      message: 'Schema file exists',
      details: schemaPath
    });
  }

  public verifyClientGenerated(): void {
    const clientPath = join(process.cwd(), '../../node_modules/@prisma/client');
    
    if (!existsSync(clientPath)) {
      this.addResult({
        name: 'Prisma Client',
        status: 'fail',
        message: 'Client not generated',
        details: 'Run: pnpm prisma:generate'
      });
      return;
    }

    // Check if client is up to date
    try {
      const schemaPath = join(process.cwd(), '../../prisma/schema.prisma');
      const clientIndexPath = join(clientPath, 'index.js');
      
      if (!existsSync(clientIndexPath)) {
        this.addResult({
          name: 'Prisma Client',
          status: 'fail',
          message: 'Client files incomplete',
          details: 'Run: pnpm prisma:generate'
        });
        return;
      }

      const fs = require('fs');
      const schemaStats = fs.statSync(schemaPath);
      const clientStats = fs.statSync(clientIndexPath);

      if (schemaStats.mtime > clientStats.mtime) {
        this.addResult({
          name: 'Prisma Client',
          status: 'warning',
          message: 'Client may be outdated',
          details: 'Schema modified after client generation. Run: pnpm prisma:generate'
        });
        return;
      }

      this.addResult({
        name: 'Prisma Client',
        status: 'pass',
        message: 'Client generated and up to date'
      });
    } catch (error) {
      this.addResult({
        name: 'Prisma Client',
        status: 'warning',
        message: 'Could not verify client status',
        details: String(error)
      });
    }
  }

  public verifyDatabaseUrl(): void {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      this.addResult({
        name: 'Database URL',
        status: 'warning',
        message: 'DATABASE_URL not configured',
        details: 'Database features will be unavailable. Set DATABASE_URL in .env.local'
      });
      return;
    }

    // Validate URL format
    try {
      const url = new URL(dbUrl);
      
      if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
        this.addResult({
          name: 'Database URL',
          status: 'fail',
          message: 'Invalid database URL protocol',
          details: `Expected postgresql:// but got ${url.protocol}`
        });
        return;
      }

      this.addResult({
        name: 'Database URL',
        status: 'pass',
        message: 'DATABASE_URL is configured',
        details: `${url.protocol}//${url.hostname}:${url.port || '5432'}${url.pathname}`
      });
    } catch (error) {
      this.addResult({
        name: 'Database URL',
        status: 'fail',
        message: 'Invalid DATABASE_URL format',
        details: 'Must be a valid PostgreSQL connection string'
      });
    }
  }

  public verifyDatabaseConnection(): void {
    if (!process.env.DATABASE_URL) {
      this.addResult({
        name: 'Database Connection',
        status: 'warning',
        message: 'Skipped (DATABASE_URL not set)'
      });
      return;
    }

    try {
      // Try to connect using Prisma
      execSync('pnpm -w exec prisma db execute --stdin --schema=../../prisma/schema.prisma', {
        input: 'SELECT 1 as connection_test;',
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 5000
      });

      this.addResult({
        name: 'Database Connection',
        status: 'pass',
        message: 'Successfully connected to database'
      });
    } catch (error) {
      this.addResult({
        name: 'Database Connection',
        status: 'fail',
        message: 'Failed to connect to database',
        details: 'Ensure PostgreSQL is running and DATABASE_URL is correct'
      });
    }
  }

  public verifyMigrationStatus(): void {
    if (!process.env.DATABASE_URL) {
      this.addResult({
        name: 'Migration Status',
        status: 'warning',
        message: 'Skipped (DATABASE_URL not set)'
      });
      return;
    }

    try {
      const output = execSync('pnpm -w exec prisma migrate status --schema=../../prisma/schema.prisma', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      if (output.includes('Database schema is up to date')) {
        this.addResult({
          name: 'Migration Status',
          status: 'pass',
          message: 'Database schema is up to date'
        });
      } else if (output.includes('pending migration')) {
        this.addResult({
          name: 'Migration Status',
          status: 'warning',
          message: 'Pending migrations detected',
          details: 'Run: pnpm prisma:migrate'
        });
      } else {
        this.addResult({
          name: 'Migration Status',
          status: 'warning',
          message: 'Could not determine migration status',
          details: output.trim()
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Migration Status',
        status: 'fail',
        message: 'Failed to check migration status',
        details: 'Run: pnpm prisma:migrate'
      });
    }
  }

  public verifyPrismaAdapter(): void {
    try {
      // Check in workspace root node_modules
      const workspaceAdapterPath = join(process.cwd(), '../../node_modules/@prisma/adapter-pg');
      // Check in local node_modules
      const localAdapterPath = join(process.cwd(), 'node_modules/@prisma/adapter-pg');
      
      if (!existsSync(workspaceAdapterPath) && !existsSync(localAdapterPath)) {
        this.addResult({
          name: 'Prisma Adapter',
          status: 'fail',
          message: '@prisma/adapter-pg not installed',
          details: 'Required for Prisma v7 PostgreSQL support. Run: pnpm install'
        });
        return;
      }

      this.addResult({
        name: 'Prisma Adapter',
        status: 'pass',
        message: '@prisma/adapter-pg is installed'
      });
    } catch (error) {
      this.addResult({
        name: 'Prisma Adapter',
        status: 'warning',
        message: 'Could not verify adapter installation'
      });
    }
  }

  public verifyDatabaseModule(): void {
    const clientPath = join(process.cwd(), 'lib/database/client.ts');
    
    if (!existsSync(clientPath)) {
      this.addResult({
        name: 'Database Module',
        status: 'fail',
        message: 'Database client module not found',
        details: `Expected: ${clientPath}`
      });
      return;
    }

    this.addResult({
      name: 'Database Module',
      status: 'pass',
      message: 'Database client module exists'
    });
  }

  public async run(): Promise<void> {
    console.log('🔍 Prisma Configuration Verification\n');
    console.log('Running checks...\n');

    // Run all verifications
    this.verifySchemaExists();
    this.verifyClientGenerated();
    this.verifyPrismaAdapter();
    this.verifyDatabaseModule();
    this.verifyDatabaseUrl();
    this.verifyDatabaseConnection();
    this.verifyMigrationStatus();

    // Display results
    console.log('='.repeat(80));
    console.log('Verification Results');
    console.log('='.repeat(80) + '\n');

    this.results.forEach(result => {
      const icon = this.getStatusIcon(result.status);
      console.log(`${icon} ${result.name}: ${result.message}`);
      if (result.details) {
        console.log(`  ${result.details}`);
      }
      console.log('');
    });

    // Summary
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;

    console.log('='.repeat(80));
    console.log(`Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
    console.log('='.repeat(80) + '\n');

    if (this.hasErrors) {
      console.log('❌ Verification failed. Please fix the errors above.\n');
      console.log('Common fixes:');
      console.log('  - Generate Prisma client: pnpm prisma:generate');
      console.log('  - Run migrations: pnpm prisma:migrate');
      console.log('  - Set DATABASE_URL in .env.local');
      console.log('  - Ensure PostgreSQL is running\n');
      process.exit(1);
    } else if (warnings > 0) {
      console.log('⚠️  Verification completed with warnings.\n');
      console.log('Some features may not work correctly. Review warnings above.\n');
      process.exit(0);
    } else {
      console.log('✅ All checks passed! Prisma is properly configured.\n');
      process.exit(0);
    }
  }
}

// Run verification
const verifier = new PrismaVerifier();
verifier.run().catch(error => {
  console.error('Verification failed with error:', error);
  process.exit(1);
});
