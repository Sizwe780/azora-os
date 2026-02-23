#!/usr/bin/env tsx
/**
 * Automated Development Setup Script
 * 
 * This script automates the setup process for Azora Buildspaces development environment.
 * It verifies prerequisites, environment configuration, and initializes the database.
 * 
 * Requirements: 5.1, 5.3, 5.4, 5.5
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface SetupStep {
  name: string;
  check: () => boolean;
  fix?: () => void;
  required: boolean;
}

class SetupManager {
  private steps: SetupStep[] = [];
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor() {
    this.defineSetupSteps();
  }

  private defineSetupSteps() {
    this.steps = [
      {
        name: 'Node.js version',
        check: () => this.checkNodeVersion(),
        required: true,
      },
      {
        name: 'pnpm installation',
        check: () => this.checkPnpm(),
        required: true,
      },
      {
        name: 'Environment file',
        check: () => this.checkEnvFile(),
        fix: () => this.createEnvFile(),
        required: true,
      },
      {
        name: 'Database URL configuration',
        check: () => this.checkDatabaseUrl(),
        required: false,
      },
      {
        name: 'NextAuth configuration',
        check: () => this.checkNextAuthConfig(),
        required: true,
      },
      {
        name: 'Prisma client generation',
        check: () => this.checkPrismaClient(),
        fix: () => this.generatePrismaClient(),
        required: true,
      },
      {
        name: 'Database migrations',
        check: () => this.checkDatabaseConnection(),
        fix: () => this.runMigrations(),
        required: false,
      },
    ];
  }

  private checkNodeVersion(): boolean {
    try {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0]);
      
      if (major < 18) {
        this.errors.push(`Node.js version ${version} is too old. Please upgrade to Node.js 18 or higher.`);
        return false;
      }
      
      console.log(`✓ Node.js ${version} detected`);
      return true;
    } catch (error) {
      this.errors.push('Failed to check Node.js version');
      return false;
    }
  }

  private checkPnpm(): boolean {
    try {
      const version = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
      console.log(`✓ pnpm ${version} detected`);
      return true;
    } catch (error) {
      this.errors.push('pnpm is not installed. Install it with: npm install -g pnpm');
      return false;
    }
  }

  private checkEnvFile(): boolean {
    const envPath = join(process.cwd(), '.env.local');
    const exists = existsSync(envPath);
    
    if (!exists) {
      this.warnings.push('.env.local file not found');
      return false;
    }
    
    console.log('✓ .env.local file exists');
    return true;
  }

  private createEnvFile(): void {
    console.log('Creating .env.local from .env.example...');
    try {
      const examplePath = join(process.cwd(), '../../.env.example');
      const targetPath = join(process.cwd(), '.env.local');
      
      if (existsSync(examplePath)) {
        const content = readFileSync(examplePath, 'utf-8');
        const fs = require('fs');
        fs.writeFileSync(targetPath, content);
        console.log('✓ Created .env.local file');
      } else {
        this.warnings.push('Could not find .env.example to copy from');
      }
    } catch (error) {
      this.warnings.push(`Failed to create .env.local: ${error}`);
    }
  }

  private checkDatabaseUrl(): boolean {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      this.warnings.push('DATABASE_URL not set. Database features will be unavailable.');
      console.log('⚠ DATABASE_URL not configured (optional for development)');
      return false;
    }
    
    console.log('✓ DATABASE_URL is configured');
    return true;
  }

  private checkNextAuthConfig(): boolean {
    const secret = process.env.NEXTAUTH_SECRET;
    const url = process.env.NEXTAUTH_URL;
    
    if (!secret) {
      this.errors.push('NEXTAUTH_SECRET is required. Generate one with: openssl rand -base64 32');
      return false;
    }
    
    if (!url) {
      this.warnings.push('NEXTAUTH_URL not set. Using default: http://localhost:3000');
    }
    
    console.log('✓ NextAuth configuration present');
    return true;
  }

  private checkPrismaClient(): boolean {
    try {
      const clientPath = join(process.cwd(), '../../node_modules/@prisma/client');
      const exists = existsSync(clientPath);
      
      if (!exists) {
        this.warnings.push('Prisma client not generated');
        return false;
      }
      
      console.log('✓ Prisma client is generated');
      return true;
    } catch (error) {
      return false;
    }
  }

  private generatePrismaClient(): void {
    console.log('Generating Prisma client...');
    try {
      execSync('pnpm prisma:generate', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✓ Prisma client generated successfully');
    } catch (error) {
      this.errors.push('Failed to generate Prisma client. Check that prisma/schema.prisma exists.');
    }
  }

  private checkDatabaseConnection(): boolean {
    if (!process.env.DATABASE_URL) {
      console.log('⚠ Skipping database connection check (DATABASE_URL not set)');
      return false;
    }
    
    try {
      // Try to connect to database
      execSync('pnpm -w exec prisma db execute --stdin --schema=../../prisma/schema.prisma', {
        input: 'SELECT 1;',
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      console.log('✓ Database connection successful');
      return true;
    } catch (error) {
      this.warnings.push('Could not connect to database. Ensure PostgreSQL is running.');
      return false;
    }
  }

  private runMigrations(): void {
    if (!process.env.DATABASE_URL) {
      console.log('⚠ Skipping migrations (DATABASE_URL not set)');
      return;
    }
    
    console.log('Running database migrations...');
    try {
      execSync('pnpm prisma:migrate', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✓ Database migrations completed');
    } catch (error) {
      this.warnings.push('Failed to run migrations. You may need to run them manually.');
    }
  }

  public async run(): Promise<void> {
    console.log('🚀 Azora Buildspaces Development Setup\n');
    console.log('Checking prerequisites...\n');

    // Run all checks
    for (const step of this.steps) {
      const passed = step.check();
      
      if (!passed && step.fix) {
        console.log(`Attempting to fix: ${step.name}...`);
        step.fix();
      }
      
      if (!passed && step.required && !step.fix) {
        this.errors.push(`Required step failed: ${step.name}`);
      }
    }

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('Setup Summary');
    console.log('='.repeat(60) + '\n');

    if (this.errors.length > 0) {
      console.log('❌ Errors:');
      this.errors.forEach(error => console.log(`  - ${error}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log('');
    }

    if (this.errors.length === 0) {
      console.log('✅ Setup completed successfully!\n');
      console.log('Next steps:');
      console.log('  1. Review and update .env.local with your configuration');
      console.log('  2. Run: pnpm dev');
      console.log('  3. Visit: http://localhost:3000\n');
      
      if (this.warnings.length > 0) {
        console.log('Note: Some optional features may not work due to warnings above.\n');
      }
      
      process.exit(0);
    } else {
      console.log('❌ Setup failed. Please fix the errors above and try again.\n');
      process.exit(1);
    }
  }
}

// Run setup
const setup = new SetupManager();
setup.run().catch(error => {
  console.error('Setup failed with error:', error);
  process.exit(1);
});
