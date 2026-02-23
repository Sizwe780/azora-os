#!/usr/bin/env tsx
/**
 * Test script to verify .env.local is being loaded
 */

// @ts-ignore
import { config } from 'dotenv'
import { resolve } from 'path'

async function main() {
  // Load .env.local explicitly
  const envPath = resolve(process.cwd(), '.env.local')
  console.log('Loading environment from:', envPath)
  console.log()

  const result = config({ path: envPath })

  if (result.error) {
    console.error('❌ Error loading .env.local:', result.error.message)
    process.exit(1)
  }

  console.log('✅ .env.local loaded successfully')
  console.log()

  // Check key variables
  console.log('Environment Variables:')
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '***configured***' : 'NOT SET'}`)
  console.log(`  NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '***configured***' : 'NOT SET'}`)
  console.log(`  NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'NOT SET'}`)
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`)
  console.log()

  // Now try to load the env config
  console.log('Testing env config module...')
  try {
    const { env, isEnvValid } = await import('../lib/config/env.js')
    console.log(`✅ Env config loaded, valid: ${isEnvValid()}`)
    console.log(`  DATABASE_URL: ${env.DATABASE_URL ? '***configured***' : 'NOT SET'}`)
    console.log(`  NEXTAUTH_SECRET: ${env.NEXTAUTH_SECRET ? '***configured***' : 'NOT SET'}`)
  } catch (error) {
    console.error('❌ Error loading env config:', error instanceof Error ? error.message : String(error))
  }
}

main().catch(console.error)
