#!/usr/bin/env node
/**
 * Verification Script: Authentication Import Migration
 * 
 * This script verifies that all authentication imports have been successfully
 * migrated from lib/auth.ts to lib/auth/config.ts
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'

console.log('🔍 Verifying authentication import migration...\n')

let hasErrors = false

// Check 1: Verify no files still import from old path
console.log('✓ Check 1: Searching for old import paths...')
try {
  const result = execSync(
    'git grep -n "from [\'\\"]@/lib/auth[\'\\"]" -- "*.ts" "*.tsx" ":!components/demo/**"',
    { encoding: 'utf-8', cwd: join(process.cwd(), 'apps/azora-buildspaces') }
  )
  
  if (result.trim()) {
    console.error('❌ Found files still importing from old path:')
    console.error(result)
    hasErrors = true
  } else {
    console.log('  ✓ No old import paths found')
  }
} catch (error: any) {
  // Exit code 1 means no matches found, which is what we want
  if (error.status === 1) {
    console.log('  ✓ No old import paths found')
  } else {
    console.error('  ❌ Error searching for old imports:', error.message)
    hasErrors = true
  }
}

// Check 2: Verify new auth module exports authOptions
console.log('\n✓ Check 2: Verifying new auth module exports...')
try {
  const authConfigPath = join(process.cwd(), 'apps/azora-buildspaces/lib/auth/config.ts')
  const authConfig = readFileSync(authConfigPath, 'utf-8')
  
  if (authConfig.includes('export const authOptions')) {
    console.log('  ✓ authOptions is exported from lib/auth/config.ts')
  } else {
    console.error('  ❌ authOptions not found in lib/auth/config.ts')
    hasErrors = true
  }
} catch (error: any) {
  console.error('  ❌ Error reading auth config:', error.message)
  hasErrors = true
}

// Check 3: Verify NextAuth API route uses new config
console.log('\n✓ Check 3: Verifying NextAuth API route...')
try {
  const nextAuthRoutePath = join(
    process.cwd(),
    'apps/azora-buildspaces/app/api/auth/[...nextauth]/route.ts'
  )
  const nextAuthRoute = readFileSync(nextAuthRoutePath, 'utf-8')
  
  if (nextAuthRoute.includes('from "@/lib/auth/config"')) {
    console.log('  ✓ NextAuth route imports from new config path')
  } else {
    console.error('  ❌ NextAuth route not using new config path')
    hasErrors = true
  }
} catch (error: any) {
  console.error('  ❌ Error reading NextAuth route:', error.message)
  hasErrors = true
}

// Check 4: Count files using new import path
console.log('\n✓ Check 4: Counting files using new import path...')
try {
  const result = execSync(
    'git grep -c "from [\'\\"]@/lib/auth/config[\'\\"]" -- "*.ts" "*.tsx" || true',
    { encoding: 'utf-8', cwd: join(process.cwd(), 'apps/azora-buildspaces') }
  )
  
  const lines = result.trim().split('\n').filter(line => line.includes(':'))
  console.log(`  ✓ Found ${lines.length} files using new import path`)
  
  if (lines.length === 0) {
    console.warn('  ⚠ Warning: No files found using new import path')
  }
} catch (error: any) {
  console.error('  ❌ Error counting new imports:', error.message)
  hasErrors = true
}

// Summary
console.log('\n' + '='.repeat(60))
if (hasErrors) {
  console.error('❌ Authentication import migration verification FAILED')
  process.exit(1)
} else {
  console.log('✅ Authentication import migration verification PASSED')
  console.log('\nAll authentication imports have been successfully migrated!')
  console.log('Next steps:')
  console.log('  1. Run tests to verify authentication flow')
  console.log('  2. Test login functionality manually')
  console.log('  3. Remove old lib/auth.ts file (Task 9)')
}
