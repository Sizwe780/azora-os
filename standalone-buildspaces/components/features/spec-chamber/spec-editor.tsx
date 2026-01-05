'use client'

import { useState } from 'react'
import { FileText, CheckCircle2, AlertCircle, Zap } from 'lucide-react'

interface SpecValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  coverage: number
}

interface TestCase {
  name: string
  description: string
  input: string
  expectedOutput: string
  generated: boolean
}

export function SpecEditor() {
  const [spec, setSpec] = useState(`# Product Spec: Authentication System

## Overview
Implement a secure authentication system with JWT tokens and refresh mechanisms.

## Requirements
- User registration with email validation
- Login with email/password
- JWT token generation (15min expiry)
- Refresh token mechanism (7 days)
- Password reset via email
- Account logout

## API Endpoints
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
POST /api/auth/refresh - Refresh JWT token
POST /api/auth/logout - Logout user
POST /api/auth/reset-password - Request password reset

## Data Models
User:
  - id: UUID
  - email: String (unique)
  - passwordHash: String
  - createdAt: DateTime
  - updatedAt: DateTime

## Security Requirements
- All passwords must be hashed with bcrypt
- JWT tokens must be signed with RS256
- HTTPS only in production
- Rate limiting on auth endpoints
- CSRF protection on all mutations

## Test Coverage
- Unit: 80%
- Integration: 70%
- E2E: 60%`)

  const [validation, setValidation] = useState<SpecValidation>({
    isValid: true,
    errors: [],
    warnings: ['Missing error handling specification'],
    coverage: 73,
  })

  const [generatedTests, setGeneratedTests] = useState<TestCase[]>([
    {
      name: 'register_valid_user',
      description: 'Should register a new user with valid credentials',
      input: 'POST /api/auth/register with email and password',
      expectedOutput: '201 Created with user object',
      generated: true,
    },
    {
      name: 'register_duplicate_email',
      description: 'Should reject registration with existing email',
      input: 'POST /api/auth/register with duplicate email',
      expectedOutput: '409 Conflict',
      generated: true,
    },
    {
      name: 'login_valid_credentials',
      description: 'Should login user with valid credentials',
      input: 'POST /api/auth/login with correct email/password',
      expectedOutput: '200 OK with JWT token',
      generated: true,
    },
  ])

  const handleValidate = () => {
    // Simulate spec validation
    setValidation({
      isValid: true,
      errors: [],
      warnings: ['Consider adding rate limiting limits'],
      coverage: 82,
    })
  }

  const handleGenerateTests = () => {
    alert('✨ Generated 8 new test cases from spec!')
    setGeneratedTests((prev) => [...prev, {
      name: 'jwt_expiry_refresh',
      description: 'Should refresh expired JWT token',
      input: 'POST /api/auth/refresh with valid refresh token',
      expectedOutput: '200 OK with new JWT token',
      generated: true,
    }])
  }

  return (
    <div className="space-y-6">
      {/* Spec Content */}
      <div className="grid grid-cols-3 gap-4 h-[500px]">
        {/* Editor */}
        <div className="col-span-2 bg-[#1e1e1e] rounded-lg border border-white/10 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Specification (SPEC.md)
            </h3>
            <button
              onClick={handleValidate}
              className="px-3 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded text-emerald-300 font-medium"
            >
              Validate Spec
            </button>
          </div>
          <textarea
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            className="flex-1 bg-[#1e1e1e] text-gray-300 p-4 font-mono text-sm focus:outline-none resize-none"
            spellCheck="false"
          />
        </div>

        {/* Validation Panel */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-4 flex flex-col">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Validation</h3>
            <div className={`p-3 rounded border ${validation.isValid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="flex items-center gap-2">
                {validation.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm font-medium text-white">
                  {validation.isValid ? 'Spec Valid' : 'Spec Invalid'}
                </span>
              </div>
            </div>
          </div>

          {validation.warnings.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Warnings ({validation.warnings.length})</p>
              <div className="space-y-1">
                {validation.warnings.map((warn, i) => (
                  <div key={i} className="text-xs text-yellow-300 p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                    {warn}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 mb-2">Test Coverage</p>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${validation.coverage}%` }}
              />
            </div>
            <p className="text-xs text-emerald-300 mt-1">{validation.coverage}% coverage</p>
          </div>
        </div>
      </div>

      {/* Generated Tests */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            AI-Generated Tests ({generatedTests.length})
          </h3>
          <button
            onClick={handleGenerateTests}
            className="px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-blue-300 font-medium"
          >
            Generate More
          </button>
        </div>

        <div className="space-y-2">
          {generatedTests.map((test, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-mono font-semibold text-emerald-400">{test.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{test.description}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-300">
                  {test.generated ? 'AI Generated' : 'Manual'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Input:</p>
                  <code className="text-gray-300 bg-black/50 p-2 rounded block">{test.input}</code>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Expected:</p>
                  <code className="text-gray-300 bg-black/50 p-2 rounded block">{test.expectedOutput}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
