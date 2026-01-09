"use client"

/**
 * Privacy Warning Component
 * 
 * Constitutional Compliance:
 * - Warns users when code indexing may use external services
 * - Requires explicit consent before sending data
 * - Emphasizes local-first approach
 */

import { AlertTriangle, Shield, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'

interface PrivacyWarningProps {
  provider: string
  onAccept: () => void
  onDecline: () => void
}

export function PrivacyWarning({ provider, onAccept, onDecline }: PrivacyWarningProps) {
  const [understood, setUnderstood] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-semibold mb-2">Privacy Notice</h2>
            <p className="text-sm text-muted-foreground">
              You are about to enable vector embeddings for enhanced semantic search.
            </p>
          </div>
        </div>

        <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>External Service Required</AlertTitle>
          <AlertDescription className="text-sm space-y-2 mt-2">
            <p>
              Embedding generation will send your code to <strong>{provider}</strong> for processing.
            </p>
            <p>
              This includes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>File contents</li>
              <li>Function and class definitions</li>
              <li>Comments and documentation</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Alert className="mb-4 border-green-500/50 bg-green-500/10">
          <Shield className="h-4 w-4 text-green-500" />
          <AlertTitle>Local-First Alternative</AlertTitle>
          <AlertDescription className="text-sm mt-2">
            <p>
              By default, Knowledge Ocean uses <strong>local keyword search</strong> with MiniSearch.
              This keeps all your code private and runs entirely in your browser.
            </p>
          </AlertDescription>
        </Alert>

        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            You can disable embeddings at any time in settings and revert to local search.
          </AlertDescription>
        </Alert>

        <div className="flex items-start gap-2 mb-6">
          <Checkbox 
            id="understood"
            checked={understood}
            onCheckedChange={(checked) => setUnderstood(checked as boolean)}
          />
          <label 
            htmlFor="understood"
            className="text-sm cursor-pointer select-none"
          >
            I understand that my code will be sent to {provider} and consent to this data transfer
          </label>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onDecline}
          >
            Use Local Search
          </Button>
          <Button
            className="flex-1"
            onClick={onAccept}
            disabled={!understood}
          >
            Enable Embeddings
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage privacy consent
 */
export function usePrivacyConsent(storageKey: string = 'knowledge-ocean-embeddings-consent') {
  const [hasConsent, setHasConsent] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(storageKey)
    return stored ? JSON.parse(stored) : null
  })

  const grantConsent = () => {
    setHasConsent(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(true))
    }
  }

  const revokeConsent = () => {
    setHasConsent(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(false))
    }
  }

  const resetConsent = () => {
    setHasConsent(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }

  return {
    hasConsent,
    grantConsent,
    revokeConsent,
    resetConsent
  }
}
