/**
 * Test script for environment configuration module
 * Verifies that env validation works correctly
 */

import { env, isEnvValid, getEnvErrorMessage, features, rooms } from '../lib/config/env'

console.log('='.repeat(60))
console.log('Environment Configuration Test')
console.log('='.repeat(60))
console.log()

// Check if environment is valid
console.log('Environment Validation Status:')
console.log(`  Valid: ${isEnvValid()}`)
console.log()

if (!isEnvValid()) {
  console.log('Validation Errors:')
  console.log(getEnvErrorMessage())
  console.log()
  console.log('⚠️  Some environment variables are missing or invalid.')
  console.log('   The application will still run but some features may not work.')
  console.log()
} else {
  console.log('✓ All required environment variables are configured correctly')
  console.log()
}

// Display key configuration values
console.log('Key Configuration Values:')
console.log(`  NODE_ENV: ${env.NODE_ENV}`)
console.log(`  BUILDSPACES_PORT: ${env.BUILDSPACES_PORT}`)
console.log(`  BUILDSPACES_ENV: ${env.BUILDSPACES_ENV}`)
console.log(`  BUILDSPACES_DEBUG: ${env.BUILDSPACES_DEBUG}`)
console.log(`  BUILDSPACES_LOG_LEVEL: ${env.BUILDSPACES_LOG_LEVEL}`)
console.log()

// Display authentication configuration
console.log('Authentication Configuration:')
console.log(`  NEXTAUTH_URL: ${env.NEXTAUTH_URL}`)
try {
  console.log(`  NEXTAUTH_SECRET: ${env.NEXTAUTH_SECRET ? '***configured***' : 'NOT SET'}`)
} catch {
  console.log(`  NEXTAUTH_SECRET: ✗ NOT SET (required)`)
}
try {
  console.log(`  JWT_SECRET: ${env.JWT_SECRET ? '***configured***' : 'NOT SET'}`)
} catch {
  console.log(`  JWT_SECRET: ✗ NOT SET (required)`)
}
console.log()

// Display database configuration
console.log('Database Configuration:')
try {
  console.log(`  DATABASE_URL: ${env.DATABASE_URL ? '***configured***' : 'NOT SET'}`)
} catch {
  console.log(`  DATABASE_URL: ✗ NOT SET (required)`)
}
console.log(`  DATABASE_POOL_SIZE: ${env.DATABASE_POOL_SIZE}`)
console.log(`  USE_POSTGRES: ${env.USE_POSTGRES}`)
console.log()

// Display Firebase configuration
console.log('Firebase Configuration:')
const firebaseConfigured = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON
console.log(`  FIREBASE_SERVICE_ACCOUNT_JSON: ${firebaseConfigured ? '✓ configured' : '✗ not configured'}`)
if (env.NODE_ENV === 'production' && !firebaseConfigured) {
  console.error('  ❌ CRITICAL: FIREBASE_SERVICE_ACCOUNT_JSON is REQUIRED in production!')
  console.error('     Phase 7 persistence will not function without this variable.')
  process.exit(1)
}
console.log()

// Display Redis configuration
console.log('Redis Configuration:')
console.log(`  USE_REDIS: ${env.USE_REDIS}`)
console.log(`  REDIS_URL: ${env.REDIS_URL ? '***configured***' : 'NOT SET'}`)
console.log()

// Display LLM provider configuration
console.log('LLM Provider Configuration:')
try {
  console.log(`  OpenAI: ${env.OPENAI_API_KEY ? '✓ configured' : '✗ not configured'}`)
} catch {
  console.log(`  OpenAI: ✗ not configured`)
}
try {
  console.log(`  Anthropic: ${env.ANTHROPIC_API_KEY ? '✓ configured' : '✗ not configured'}`)
} catch {
  console.log(`  Anthropic: ✗ not configured`)
}
try {
  console.log(`  Local LLM: ${env.LOCAL_LLM_API_URL ? '✓ configured' : '✗ not configured'}`)
} catch {
  console.log(`  Local LLM: ✗ not configured`)
}
console.log()

// Display feature flags
console.log('Feature Flags:')
const safeCheckFeature = (name: string, fn: () => boolean): boolean => {
  try {
    return fn()
  } catch {
    return false
  }
}

console.log(`  Redis: ${safeCheckFeature('redis', features.redis)}`)
console.log(`  PostgreSQL: ${safeCheckFeature('postgres', features.postgres)}`)
console.log(`  WebSocket Collaboration: ${safeCheckFeature('websocketCollaboration', features.websocketCollaboration)}`)
console.log(`  Constitutional Gates: ${safeCheckFeature('constitutionalGates', features.constitutionalGates)}`)
console.log(`  Agent Execution: ${safeCheckFeature('agentExecution', features.agentExecution)}`)
console.log(`  Terminal: ${safeCheckFeature('terminal', features.terminal)}`)
console.log(`  Notebook: ${safeCheckFeature('notebook', features.notebook)}`)
console.log(`  Figma: ${safeCheckFeature('figma', features.figma)}`)
console.log(`  Stripe: ${safeCheckFeature('stripe', features.stripe)}`)
console.log(`  GitHub: ${safeCheckFeature('github', features.github)}`)
console.log(`  OpenAI: ${safeCheckFeature('openai', features.openai)}`)
console.log(`  Anthropic: ${safeCheckFeature('anthropic', features.anthropic)}`)
console.log(`  Local LLM: ${safeCheckFeature('localLLM', features.localLLM)}`)
console.log(`  AZR Minting: ${safeCheckFeature('azrMinting', features.azrMinting)}`)
console.log()

// Display room toggles
console.log('Room Toggles:')
console.log(`  Code Chamber: ${safeCheckFeature('codeChamber', rooms.codeChamber)}`)
console.log(`  Spec Chamber: ${safeCheckFeature('specChamber', rooms.specChamber)}`)
console.log(`  Design Studio: ${safeCheckFeature('designStudio', rooms.designStudio)}`)
console.log(`  AI Studio: ${safeCheckFeature('aiStudio', rooms.aiStudio)}`)
console.log(`  Command Desk: ${safeCheckFeature('commandDesk', rooms.commandDesk)}`)
console.log(`  Maker Lab: ${safeCheckFeature('makerLab', rooms.makerLab)}`)
console.log(`  Collaboration Pod: ${safeCheckFeature('collaborationPod', rooms.collaborationPod)}`)
console.log(`  Collectible Showcase: ${safeCheckFeature('collectibleShowcase', rooms.collectibleShowcase)}`)
console.log()

console.log('='.repeat(60))
console.log('Test Complete')
console.log('='.repeat(60))
