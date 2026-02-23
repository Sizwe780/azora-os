#!/usr/bin/env tsx
/**
 * Code Organization Verification Script
 * 
 * Verifies that the code organization follows the design specifications:
 * - All database code is in lib/database/
 * - All auth code is in lib/auth/
 * - All config code is in lib/config/
 * - No duplicate implementations exist
 * - Clear separation of concerns
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.5
 */

import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { readFileSync } from 'fs'

interface VerificationResult {
  category: string
  passed: boolean
  message: string
  details?: string[]
}

const results: VerificationResult[] = []

console.log('=' .repeat(70))
console.log('Code Organization Verification')
console.log('=' .repeat(70))
console.log()

// Helper function to check if a directory exists and has files
function checkDirectory(path: string, description: string): boolean {
  const fullPath = join(process.cwd(), path)
  
  if (!existsSync(fullPath)) {
    results.push({
      category: description,
      passed: false,
      message: `Directory not found: ${path}`
    })
    return false
  }

  const files = readdirSync(fullPath).filter(f => {
    const stat = statSync(join(fullPath, f))
    return stat.isFile() && (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js'))
  })

  if (files.length === 0) {
    results.push({
      category: description,
      passed: false,
      message: `No files found in ${path}`
    })
    return false
  }

  results.push({
    category: description,
    passed: true,
    message: `✓ ${description} properly organized`,
    details: files
  })
  return true
}

// Helper function to check if deprecated files exist
function checkDeprecatedFiles(files: string[], description: string): boolean {
  const existingFiles = files.filter(f => existsSync(join(process.cwd(), f)))
  
  if (existingFiles.length > 0) {
    results.push({
      category: description,
      passed: false,
      message: `Deprecated files still exist`,
      details: existingFiles
    })
    return false
  }

  results.push({
    category: description,
    passed: true,
    message: `✓ ${description} removed`
  })
  return true
}

// Helper function to search for deprecated imports
function searchForDeprecatedImports(directory: string, patterns: string[]): string[] {
  const foundFiles: string[] = []
  
  function searchDir(dir: string) {
    try {
      const items = readdirSync(dir)
      
      for (const item of items) {
        const fullPath = join(dir, item)
        const stat = statSync(fullPath)
        
        if (stat.isDirectory()) {
          // Skip node_modules and .next
          if (item !== 'node_modules' && item !== '.next' && item !== 'dist') {
            searchDir(fullPath)
          }
        } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js')) {
          // Skip the verification script itself
          if (fullPath.includes('verify-code-organization.ts')) {
            continue
          }
          
          try {
            const content = readFileSync(fullPath, 'utf-8')
            
            for (const pattern of patterns) {
              if (content.includes(pattern)) {
                foundFiles.push(fullPath.replace(process.cwd(), ''))
                break
              }
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  searchDir(directory)
  return foundFiles
}

console.log('1. Verifying Database Code Organization...')
console.log('-'.repeat(70))

// Check database module structure
checkDirectory('lib/database', 'Database module')

// Check for required database files
const databaseFiles = ['client.ts', 'types.ts', 'utils.ts', 'index.ts']
const missingDatabaseFiles = databaseFiles.filter(f => !existsSync(join(process.cwd(), 'lib/database', f)))

if (missingDatabaseFiles.length > 0) {
  results.push({
    category: 'Database module files',
    passed: false,
    message: 'Missing required database files',
    details: missingDatabaseFiles
  })
} else {
  results.push({
    category: 'Database module files',
    passed: true,
    message: '✓ All required database files present'
  })
}

console.log()
console.log('2. Verifying Authentication Code Organization...')
console.log('-'.repeat(70))

// Check auth module structure
checkDirectory('lib/auth', 'Authentication module')

// Check for required auth files
const authFiles = ['config.ts', 'providers.ts', 'callbacks.ts', 'utils.ts', 'index.ts']
const missingAuthFiles = authFiles.filter(f => !existsSync(join(process.cwd(), 'lib/auth', f)))

if (missingAuthFiles.length > 0) {
  results.push({
    category: 'Auth module files',
    passed: false,
    message: 'Missing required auth files',
    details: missingAuthFiles
  })
} else {
  results.push({
    category: 'Auth module files',
    passed: true,
    message: '✓ All required auth files present'
  })
}

console.log()
console.log('3. Verifying Configuration Code Organization...')
console.log('-'.repeat(70))

// Check config module structure
checkDirectory('lib/config', 'Configuration module')

// Check for required config files
const configFiles = ['env.ts', 'constants.ts', 'index.ts']
const missingConfigFiles = configFiles.filter(f => !existsSync(join(process.cwd(), 'lib/config', f)))

if (missingConfigFiles.length > 0) {
  results.push({
    category: 'Config module files',
    passed: false,
    message: 'Missing required config files',
    details: missingConfigFiles
  })
} else {
  results.push({
    category: 'Config module files',
    passed: true,
    message: '✓ All required config files present'
  })
}

console.log()
console.log('4. Checking for Duplicate Implementations...')
console.log('-'.repeat(70))

// Check for deprecated database files
checkDeprecatedFiles(['lib/db.ts', 'lib/prisma.ts'], 'Deprecated database files')

// Check for deprecated auth files (if any existed)
checkDeprecatedFiles(['lib/auth.ts'], 'Deprecated auth files')

console.log()
console.log('5. Verifying Separation of Concerns...')
console.log('-'.repeat(70))

// Check for deprecated imports
const deprecatedImports = [
  "from 'lib/db'",
  'from "lib/db"',
  "from '@/lib/db'",
  'from "@/lib/db"',
  "from 'lib/prisma'",
  'from "lib/prisma"',
  "from '@/lib/prisma'",
  'from "@/lib/prisma"'
]

console.log('Searching for deprecated imports...')
const filesWithDeprecatedImports = searchForDeprecatedImports(process.cwd(), deprecatedImports)

if (filesWithDeprecatedImports.length > 0) {
  results.push({
    category: 'Deprecated imports',
    passed: false,
    message: 'Found files with deprecated imports',
    details: filesWithDeprecatedImports
  })
} else {
  results.push({
    category: 'Deprecated imports',
    passed: true,
    message: '✓ No deprecated imports found'
  })
}

// Check for proper module exports
console.log()
console.log('Checking module exports...')

const moduleExports = [
  { file: 'lib/database/index.ts', description: 'Database module exports' },
  { file: 'lib/auth/index.ts', description: 'Auth module exports' },
  { file: 'lib/config/index.ts', description: 'Config module exports' }
]

for (const { file, description } of moduleExports) {
  const fullPath = join(process.cwd(), file)
  
  if (existsSync(fullPath)) {
    const content = readFileSync(fullPath, 'utf-8')
    
    if (content.includes('export')) {
      results.push({
        category: description,
        passed: true,
        message: `✓ ${description} configured`
      })
    } else {
      results.push({
        category: description,
        passed: false,
        message: `${description} missing exports`
      })
    }
  } else {
    results.push({
      category: description,
      passed: false,
      message: `${description} file not found`
    })
  }
}

// Print summary
console.log()
console.log('=' .repeat(70))
console.log('Verification Summary')
console.log('=' .repeat(70))
console.log()

const passed = results.filter(r => r.passed).length
const total = results.length
const percentage = Math.round((passed / total) * 100)

console.log(`Results: ${passed}/${total} checks passed (${percentage}%)`)
console.log()

// Group results by pass/fail
const passedResults = results.filter(r => r.passed)
const failedResults = results.filter(r => !r.passed)

if (passedResults.length > 0) {
  console.log('✅ Passed Checks:')
  passedResults.forEach(r => {
    console.log(`  ${r.message}`)
    if (r.details && r.details.length > 0 && r.details.length <= 5) {
      r.details.forEach(d => console.log(`    - ${d}`))
    }
  })
  console.log()
}

if (failedResults.length > 0) {
  console.log('❌ Failed Checks:')
  failedResults.forEach(r => {
    console.log(`  ${r.category}: ${r.message}`)
    if (r.details) {
      r.details.forEach(d => console.log(`    - ${d}`))
    }
  })
  console.log()
}

// Print recommendations
console.log('=' .repeat(70))
console.log('Recommendations')
console.log('=' .repeat(70))
console.log()

if (failedResults.length === 0) {
  console.log('✅ Code organization is properly structured!')
  console.log('   All modules follow the design specifications.')
} else {
  console.log('To fix the issues:')
  console.log()
  
  const hasDeprecatedFiles = failedResults.some(r => r.category.includes('Deprecated'))
  const hasDeprecatedImports = failedResults.some(r => r.category === 'Deprecated imports')
  const hasMissingFiles = failedResults.some(r => r.message.includes('Missing'))
  
  if (hasDeprecatedFiles) {
    console.log('1. Remove deprecated files:')
    failedResults
      .filter(r => r.category.includes('Deprecated') && r.details)
      .forEach(r => {
        r.details?.forEach(f => console.log(`   rm ${f}`))
      })
    console.log()
  }
  
  if (hasDeprecatedImports) {
    console.log('2. Update deprecated imports:')
    console.log('   Run: pnpm verify:auth-imports')
    console.log('   Or manually update imports in the listed files')
    console.log()
  }
  
  if (hasMissingFiles) {
    console.log('3. Create missing files:')
    failedResults
      .filter(r => r.message.includes('Missing') && r.details)
      .forEach(r => {
        console.log(`   ${r.category}:`)
        r.details?.forEach(f => console.log(`     - ${f}`))
      })
    console.log()
  }
}

console.log('=' .repeat(70))
console.log()

// Exit with appropriate code
process.exit(failedResults.length === 0 ? 0 : 1)
