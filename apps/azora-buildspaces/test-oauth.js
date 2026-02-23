#!/usr/bin/env node

/**
 * Test OAuth Configuration
 * Verifies that OAuth providers are properly configured
 */

const fs = require('fs')
const path = require('path')

// Load environment variables manually
const envPath = path.join(__dirname, '.env')
let envContent = ''
try {
  envContent = fs.readFileSync(envPath, 'utf8')
} catch (e) {
  console.log('❌ Could not read .env file')
  process.exit(1)
}

console.log('🔍 Testing OAuth Configuration...\n')

// Extract environment variables
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
  }
})

// Check Google OAuth
const googleConfigured = envVars.GOOGLE_CLIENT_ID && envVars.GOOGLE_CLIENT_SECRET
console.log('📧 Google OAuth:', googleConfigured ? '✅ Configured' : '❌ Not configured')
if (googleConfigured) {
  console.log(`   Client ID: ${envVars.GOOGLE_CLIENT_ID.substring(0, 20)}...`)
}

// Check GitHub OAuth
const githubConfigured = envVars.GITHUB_ID && envVars.GITHUB_SECRET
console.log('🐙 GitHub OAuth:', githubConfigured ? '✅ Configured' : '❌ Not configured')
if (githubConfigured) {
  console.log(`   App ID: ${envVars.GITHUB_ID}`)
}

// Check NextAuth
const nextAuthConfigured = envVars.NEXTAUTH_SECRET && envVars.NEXTAUTH_URL
console.log('🔐 NextAuth:', nextAuthConfigured ? '✅ Configured' : '❌ Not configured')
if (nextAuthConfigured) {
  console.log(`   URL: ${envVars.NEXTAUTH_URL}`)
}

// Check favicon
const faviconPath = path.join(__dirname, 'public', 'favicon.svg')
const faviconExists = fs.existsSync(faviconPath)
console.log('🎨 Favicon:', faviconExists ? '✅ Created' : '❌ Missing')

console.log('\n📋 Summary:')
console.log(`   Total providers configured: ${[googleConfigured, githubConfigured].filter(Boolean).length}`)
console.log(`   Ready for OAuth login: ${googleConfigured && githubConfigured ? '✅ Yes' : '❌ No'}`)

if (googleConfigured && githubConfigured) {
  console.log('\n🎉 OAuth configuration is ready! You can now test Google and GitHub login.')
  console.log('   Visit: http://localhost:3002/auth/login')
} else {
  console.log('\n⚠️  Some OAuth providers are not configured. Check your .env file.')
}
