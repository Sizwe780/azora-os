"use client"

/**
 * Spec Editor - Dual-Pane Specification Editor
 * 
 * Constitutional Compliance:
 * - TRUTH VERIFICATION: Every spec must include how to prove it works
 * - NO MOCK: Real YAML generation, real validation
 * - RATIFY DISABLED: Cannot ratify without truth verification
 * 
 * Left pane: Form-based input for structured specification
 * Right pane: Real-time YAML preview (read-only)
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fileSystem } from '@/lib/workspace/file-system'
import yaml from 'js-yaml'
import {
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Save,
  Wand2,
  Shield,
} from 'lucide-react'

/**
 * JSON Schema for Spec Validation
 */
const SPEC_SCHEMA = {
  type: 'object',
  required: ['id', 'name', 'scenarios', 'truth_verification'],
  properties: {
    id: {
      type: 'string',
      pattern: '^[a-z0-9-]+$',
      minLength: 3,
    },
    name: {
      type: 'string',
      minLength: 3,
    },
    user_story: {
      type: 'string',
      minLength: 10,
    },
    scenarios: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['given', 'when', 'then'],
        properties: {
          given: { type: 'string', minLength: 5 },
          when: { type: 'string', minLength: 5 },
          then: { type: 'string', minLength: 5 },
        },
      },
    },
    truth_verification: {
      type: 'object',
      required: ['method', 'criteria'],
      properties: {
        method: {
          type: 'string',
          enum: ['automated_test', 'manual_verification', 'user_acceptance', 'integration_test'],
        },
        criteria: {
          type: 'array',
          minItems: 1,
          items: { type: 'string', minLength: 5 },
        },
      },
    },
  },
}

interface Scenario {
  given: string
  when: string
  then: string
}

interface TruthVerification {
  method: string
  criteria: string[]
}

interface Specification {
  id: string
  name: string
  user_story: string
  scenarios: Scenario[]
  acceptance_criteria: string[]
  truth_verification: TruthVerification
}

export function SpecEditor() {
  const [spec, setSpec] = useState<Specification>({
    id: '',
    name: '',
    user_story: '',
    scenarios: [{ given: '', when: '', then: '' }],
    acceptance_criteria: [],
    truth_verification: {
      method: 'automated_test',
      criteria: [],
    },
  })

  const [yamlPreview, setYamlPreview] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Generate YAML preview in real-time
  useEffect(() => {
    try {
      const yamlString = yaml.dump(spec)
      setYamlPreview(yamlString)
    } catch (error) {
      setYamlPreview('# Error generating YAML')
    }
  }, [spec])

  // Validate specification
  useEffect(() => {
    const errors: string[] = []

    if (!spec.id || spec.id.length < 3) {
      errors.push('ID must be at least 3 characters')
    }
    if (!/^[a-z0-9-]+$/.test(spec.id)) {
      errors.push('ID must contain only lowercase letters, numbers, and hyphens')
    }
    if (!spec.name || spec.name.length < 3) {
      errors.push('Name must be at least 3 characters')
    }
    if (spec.scenarios.length === 0) {
      errors.push('At least one scenario is required')
    }
    spec.scenarios.forEach((scenario, idx) => {
      if (!scenario.given || scenario.given.length < 5) {
        errors.push(`Scenario ${idx + 1}: Given must be at least 5 characters`)
      }
      if (!scenario.when || scenario.when.length < 5) {
        errors.push(`Scenario ${idx + 1}: When must be at least 5 characters`)
      }
      if (!scenario.then || scenario.then.length < 5) {
        errors.push(`Scenario ${idx + 1}: Then must be at least 5 characters`)
      }
    })

    // Constitutional Check: Truth Verification Required
    if (
      !spec.truth_verification.method ||
      spec.truth_verification.criteria.length === 0
    ) {
      errors.push('⚠️ CONSTITUTIONAL: Truth verification method and criteria required')
    }

    setValidationErrors(errors)
  }, [spec])

  const handleRatify = async () => {
    if (validationErrors.length > 0) {
      return
    }

    setIsSaving(true)
    try {
      // Save to VFS: specs/[id].yaml
      const yamlContent = yaml.dump(spec)
      await fileSystem.writeFile(`/specs/${spec.id}.yaml`, yamlContent)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save spec:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addScenario = () => {
    setSpec({
      ...spec,
      scenarios: [...spec.scenarios, { given: '', when: '', then: '' }],
    })
  }

  const updateScenario = (index: number, field: keyof Scenario, value: string) => {
    const newScenarios = [...spec.scenarios]
    newScenarios[index][field] = value
    setSpec({ ...spec, scenarios: newScenarios })
  }

  const addCriterion = () => {
    setSpec({
      ...spec,
      truth_verification: {
        ...spec.truth_verification,
        criteria: [...spec.truth_verification.criteria, ''],
      },
    })
  }

  const updateCriterion = (index: number, value: string) => {
    const newCriteria = [...spec.truth_verification.criteria]
    newCriteria[index] = value
    setSpec({
      ...spec,
      truth_verification: {
        ...spec.truth_verification,
        criteria: newCriteria,
      },
    })
  }

  const canRatify = validationErrors.length === 0

  return (
    <div className="flex h-full gap-4 p-4 bg-background">
      {/* Left Pane: Form-Based Input */}
      <div className="flex-1 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Specification Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-6 pr-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="spec-id">Spec ID *</Label>
                    <Input
                      id="spec-id"
                      value={spec.id}
                      onChange={(e) => setSpec({ ...spec, id: e.target.value })}
                      placeholder="login-feature"
                      className="font-mono"
                    />
                  </div>

                  <div>
                    <Label htmlFor="spec-name">Feature Name *</Label>
                    <Input
                      id="spec-name"
                      value={spec.name}
                      onChange={(e) => setSpec({ ...spec, name: e.target.value })}
                      placeholder="User Login System"
                    />
                  </div>

                  <div>
                    <Label htmlFor="user-story">User Story *</Label>
                    <Textarea
                      id="user-story"
                      value={spec.user_story}
                      onChange={(e) => setSpec({ ...spec, user_story: e.target.value })}
                      placeholder="As a user, I want to..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Scenarios */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Scenarios (BDD Format) *</Label>
                    <Button onClick={addScenario} size="sm" variant="outline">
                      Add Scenario
                    </Button>
                  </div>

                  {spec.scenarios.map((scenario, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-sm">Scenario {idx + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Given (Context)</Label>
                          <Input
                            value={scenario.given}
                            onChange={(e) => updateScenario(idx, 'given', e.target.value)}
                            placeholder="User is on login page"
                          />
                        </div>
                        <div>
                          <Label>When (Action)</Label>
                          <Input
                            value={scenario.when}
                            onChange={(e) => updateScenario(idx, 'when', e.target.value)}
                            placeholder="User enters valid credentials"
                          />
                        </div>
                        <div>
                          <Label>Then (Expected Result)</Label>
                          <Input
                            value={scenario.then}
                            onChange={(e) => updateScenario(idx, 'then', e.target.value)}
                            placeholder="User is redirected to dashboard"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Truth Verification (Constitutional Requirement) */}
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Truth Verification (Required) *
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Verification Method</Label>
                      <select
                        value={spec.truth_verification.method}
                        onChange={(e) =>
                          setSpec({
                            ...spec,
                            truth_verification: {
                              ...spec.truth_verification,
                              method: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded px-3 py-2 bg-background"
                      >
                        <option value="automated_test">Automated Test</option>
                        <option value="manual_verification">Manual Verification</option>
                        <option value="user_acceptance">User Acceptance Test</option>
                        <option value="integration_test">Integration Test</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Verification Criteria</Label>
                        <Button onClick={addCriterion} size="sm" variant="outline">
                          Add Criterion
                        </Button>
                      </div>
                      {spec.truth_verification.criteria.map((criterion, idx) => (
                        <div key={idx} className="mb-2">
                          <Input
                            value={criterion}
                            onChange={(e) => updateCriterion(idx, e.target.value)}
                            placeholder="Unit tests pass with 90%+ coverage"
                          />
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-emerald-400">
                      Constitutional AI: We do not build things we cannot verify
                    </p>
                  </CardContent>
                </Card>

                {/* Ratify Button */}
                <div className="space-y-2">
                  <Button
                    onClick={handleRatify}
                    disabled={!canRatify || isSaving}
                    className="w-full"
                    size="lg"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Ratifying...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Ratified Successfully!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Ratify Specification
                      </>
                    )}
                  </Button>

                  {!canRatify && (
                    <p className="text-xs text-red-400 text-center">
                      Cannot ratify: Fix validation errors first
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Pane: YAML Preview + Validation */}
      <div className="w-[500px] flex flex-col gap-4">
        {/* Validation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {validationErrors.length === 0 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Valid Specification
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  {validationErrors.length} Validation Error(s)
                </>
              )}
            </CardTitle>
          </CardHeader>
          {validationErrors.length > 0 && (
            <CardContent>
              <ul className="space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-xs text-red-400 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>

        {/* YAML Preview */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              YAML Preview (Read-Only)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-400px)]">
              <pre className="text-xs font-mono bg-black/20 p-4 rounded overflow-x-auto">
                {yamlPreview}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
