#!/usr/bin/env tsx
/**
 * Prisma Client Generation Verification Script
 * 
 * This script verifies that the Prisma client has been properly generated
 * and can connect to the database.
 * 
 * Requirements verified:
 * - 1.1: Prisma client is generated
 * - 1.2: Client is available in node_modules/@prisma/client
 * - 1.5: Client is available to all application modules
 * - 5.3: Clear instructions for Prisma client generation
 */

import { existsSync } from 'fs';
import { join } from 'path';

interface VerificationResult {
  step: string;
  passed: boolean;
  message: string;
  details?: string;
}

async function main() {
const results: VerificationResult[] = [];

console.log('🔍 Verifying Prisma Client Generation\n');
console.log('=' .repeat(60));

// Step 1: Check if Prisma CLI is available
console.log('\n📦 Step 1: Checking Prisma CLI availability...');
try {
  const prismaCliPath = join(process.cwd(), '../../node_modules/.bin/prisma');
  const prismaCliExists = existsSync(prismaCliPath) || existsSync(prismaCliPath + '.cmd');
  
  if (prismaCliExists) {
    results.push({
      step: 'Prisma CLI',
      passed: true,
      message: 'Prisma CLI is installed',
      details: prismaCliPath
    });
    console.log('✅ Prisma CLI found');
  } else {
    results.push({
      step: 'Prisma CLI',
      passed: false,
      message: 'Prisma CLI not found',
      details: 'Run: pnpm install'
    });
    console.log('❌ Prisma CLI not found');
    console.log('   Run: pnpm install');
  }
} catch (error) {
  results.push({
    step: 'Prisma CLI',
    passed: false,
    message: 'Error checking Prisma CLI',
    details: error instanceof Error ? error.message : String(error)
  });
  console.log('❌ Error checking Prisma CLI');
}

// Step 2: Check if @prisma/client is generated
console.log('\n📦 Step 2: Checking if @prisma/client is generated...');
try {
  const prismaClientPath = join(process.cwd(), '../../node_modules/@prisma/client');
  const prismaClientExists = existsSync(prismaClientPath);
  
  if (prismaClientExists) {
    // Check for the generated index.js file
    const indexPath = join(prismaClientPath, 'index.js');
    const indexExists = existsSync(indexPath);
    
    if (indexExists) {
      results.push({
        step: '@prisma/client',
        passed: true,
        message: 'Prisma client is generated',
        details: prismaClientPath
      });
      console.log('✅ @prisma/client is generated');
    } else {
      results.push({
        step: '@prisma/client',
        passed: false,
        message: 'Prisma client package exists but not generated',
        details: 'Run: pnpm prisma:generate'
      });
      console.log('❌ @prisma/client package exists but not generated');
      console.log('   Run: pnpm prisma:generate');
    }
  } else {
    results.push({
      step: '@prisma/client',
      passed: false,
      message: '@prisma/client not found',
      details: 'Run: pnpm install && pnpm prisma:generate'
    });
    console.log('❌ @prisma/client not found');
    console.log('   Run: pnpm install && pnpm prisma:generate');
  }
} catch (error) {
  results.push({
    step: '@prisma/client',
    passed: false,
    message: 'Error checking @prisma/client',
    details: error instanceof Error ? error.message : String(error)
  });
  console.log('❌ Error checking @prisma/client');
}

// Step 3: Check if Prisma schema exists
console.log('\n📦 Step 3: Checking Prisma schema...');
try {
  const schemaPath = join(process.cwd(), '../../prisma/schema.prisma');
  const schemaExists = existsSync(schemaPath);
  
  if (schemaExists) {
    results.push({
      step: 'Prisma Schema',
      passed: true,
      message: 'Prisma schema found',
      details: schemaPath
    });
    console.log('✅ Prisma schema found at prisma/schema.prisma');
  } else {
    results.push({
      step: 'Prisma Schema',
      passed: false,
      message: 'Prisma schema not found',
      details: 'Expected at: prisma/schema.prisma'
    });
    console.log('❌ Prisma schema not found');
  }
} catch (error) {
  results.push({
    step: 'Prisma Schema',
    passed: false,
    message: 'Error checking Prisma schema',
    details: error instanceof Error ? error.message : String(error)
  });
  console.log('❌ Error checking Prisma schema');
}

// Step 4: Try to import the database client
console.log('\n📦 Step 4: Testing database client import...');
try {
  // Try to import the database client module
  const clientModule = await import('../lib/database/client.js');
  
  if (clientModule.prisma) {
    results.push({
      step: 'Database Client Import',
      passed: true,
      message: 'Database client can be imported',
      details: 'lib/database/client.ts exports prisma successfully'
    });
    console.log('✅ Database client can be imported');
    
    // Check if PRISMA_AVAILABLE flag is exported
    if (typeof clientModule.PRISMA_AVAILABLE === 'boolean') {
      console.log(`   PRISMA_AVAILABLE: ${clientModule.PRISMA_AVAILABLE}`);
      
      if (clientModule.PRISMA_AVAILABLE) {
        results.push({
          step: 'Prisma Availability',
          passed: true,
          message: 'Prisma client is available and configured',
        });
        console.log('✅ Prisma client is available and configured');
      } else {
        results.push({
          step: 'Prisma Availability',
          passed: false,
          message: 'Prisma client is not available',
          details: 'Check DATABASE_URL environment variable'
        });
        console.log('⚠️  Prisma client is not available (DATABASE_URL may not be set)');
      }
    }
  } else {
    results.push({
      step: 'Database Client Import',
      passed: false,
      message: 'Database client module does not export prisma',
    });
    console.log('❌ Database client module does not export prisma');
  }
} catch (error) {
  results.push({
    step: 'Database Client Import',
    passed: false,
    message: 'Cannot import database client',
    details: error instanceof Error ? error.message : String(error)
  });
  console.log('❌ Cannot import database client');
  console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
}

// Step 5: Test database connection (if available)
console.log('\n📦 Step 5: Testing database connection...');
try {
  const clientModule = await import('../lib/database/client.js');
  
  if (clientModule.PRISMA_AVAILABLE && clientModule.prisma) {
    // Try a simple query
    await clientModule.prisma.$queryRaw`SELECT 1 as test`;
    
    results.push({
      step: 'Database Connection',
      passed: true,
      message: 'Successfully connected to database',
    });
    console.log('✅ Successfully connected to database');
  } else {
    results.push({
      step: 'Database Connection',
      passed: false,
      message: 'Prisma client not available for connection test',
      details: 'Skipped - DATABASE_URL not configured'
    });
    console.log('⚠️  Skipped - Prisma client not available');
  }
} catch (error) {
  results.push({
    step: 'Database Connection',
    passed: false,
    message: 'Database connection failed',
    details: error instanceof Error ? error.message : String(error)
  });
  console.log('❌ Database connection failed');
  console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Verification Summary\n');

const passed = results.filter(r => r.passed).length;
const total = results.length;
const percentage = Math.round((passed / total) * 100);

console.log(`Results: ${passed}/${total} checks passed (${percentage}%)\n`);

results.forEach((result, index) => {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.step}: ${result.message}`);
  if (result.details) {
    console.log(`   ${result.details}`);
  }
});

// Print recommendations
console.log('\n' + '='.repeat(60));
console.log('\n💡 Recommendations\n');

const failedSteps = results.filter(r => !r.passed);

if (failedSteps.length === 0) {
  console.log('✅ All checks passed! Prisma client is properly generated and configured.');
} else {
  console.log('To fix the issues, run the following commands:\n');
  
  const needsInstall = failedSteps.some(s => 
    s.step === 'Prisma CLI' || s.step === '@prisma/client'
  );
  
  if (needsInstall) {
    console.log('1. Install dependencies:');
    console.log('   pnpm install\n');
  }
  
  const needsGenerate = failedSteps.some(s => 
    s.step === '@prisma/client' && s.message.includes('not generated')
  );
  
  if (needsGenerate) {
    console.log('2. Generate Prisma client:');
    console.log('   pnpm prisma:generate\n');
  }
  
  const needsDatabase = failedSteps.some(s => 
    s.step === 'Database Connection' || s.step === 'Prisma Availability'
  );
  
  if (needsDatabase) {
    console.log('3. Configure database:');
    console.log('   - Copy .env.example to .env.local');
    console.log('   - Set DATABASE_URL in .env.local');
    console.log('   - Run: pnpm prisma:migrate\n');
  }
}

console.log('\n' + '='.repeat(60));

// Exit with appropriate code
const allPassed = failedSteps.length === 0;
process.exit(allPassed ? 0 : 1);
}
main().catch(console.error);
