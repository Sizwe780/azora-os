'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Key, 
  Brain, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Sparkles,
  Zap,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface APIKeyConfig {
  openai?: string
  anthropic?: string
  elevenlabs?: string
}

interface AzoraPilotStatus {
  status: 'connected' | 'disconnected' | 'checking'
  url: string
  modelLoaded: boolean
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<APIKeyConfig>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [useAzoraPilot, setUseAzoraPilot] = useState(true)
  const [azoraPilotUrl, setAzoraPilotUrl] = useState('http://localhost:8000')
  const [pilotStatus, setPilotStatus] = useState<AzoraPilotStatus>({
    status: 'checking',
    url: 'http://localhost:8000',
    modelLoaded: false
  })
  const [testingKeys, setTestingKeys] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, { status: string; message: string }>>({})
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState('ai-services')

  const testApiKey = async (provider: string, apiKey: string) => {
    if (!apiKey) return

    setTestingKeys(prev => ({ ...prev, [provider]: true }))
    setTestResults(prev => ({ ...prev, [provider]: { status: 'testing', message: 'Testing connection...' } }))

    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey })
      })

      const data = await response.json()

      if (data.success) {
        setTestResults(prev => ({
          ...prev,
          [provider]: { status: data.data.status, message: data.data.message }
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          [provider]: { status: 'error', message: data.error || 'Test failed' }
        }))
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { status: 'error', message: error instanceof Error ? error.message : 'Test failed' }
      }))
    } finally {
      setTestingKeys(prev => ({ ...prev, [provider]: false }))
    }
  }

  useEffect(() => {
    loadSettings()
    checkAzoraPilotStatus()
  }, [])

  const loadSettings = async () => {
    try {
      const saved = localStorage.getItem('azora-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        setApiKeys(settings.apiKeys || {})
        setUseAzoraPilot(settings.useAzoraPilot ?? true)
        setAzoraPilotUrl(settings.azoraPilotUrl || 'http://localhost:8000')
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const checkAzoraPilotStatus = async () => {
    try {
      setPilotStatus(prev => ({ ...prev, status: 'checking' }))
      const response = await fetch(`/api/ai-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'azora-pilot', url: azoraPilotUrl })
      })
      const data = await response.json()
      
      if (data.success) {
        setPilotStatus({
          status: data.data.status === 'success' ? 'connected' : 'disconnected',
          url: azoraPilotUrl,
          modelLoaded: data.data.status === 'success'
        })
      } else {
        setPilotStatus({ status: 'disconnected', url: azoraPilotUrl, modelLoaded: false })
      }
    } catch (error) {
      setPilotStatus({ status: 'disconnected', url: azoraPilotUrl, modelLoaded: false })
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setSaveStatus('idle')

    try {
      const settings = {
        apiKeys,
        useAzoraPilot,
        azoraPilotUrl,
        constitutionalSettings: {
          truthScoreThreshold: 95,
          complianceThreshold: 95,
          enableToolExecution: false,
          toolRateLimit: 5,
        }
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('azora-settings', JSON.stringify({
          apiKeys,
          useAzoraPilot,
          azoraPilotUrl
        }))
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        console.error('Settings save failed:', data.error)
      }
    } catch (error) {
      setSaveStatus('error')
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateApiKey = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }))
  }

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  const getStatusIcon = () => {
    switch (pilotStatus.status) {
      case 'connected':
        return <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_theme(colors.green.400)]" />
      case 'disconnected':
        return <div className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_6px_theme(colors.red.400)]" />
      default:
        return <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
    }
  }

  const tabs = [
    { id: 'ai-services', label: 'AI Services', icon: Brain },
    { id: 'constitutional', label: 'Constitutional AI', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-10">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08]">
                <Settings className="h-6 w-6 text-gray-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  BuildSpaces Settings
                </h1>
                <p className="text-gray-400 mt-1">
                  Configure your AI services and constitutional preferences
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-white/[0.08] text-white border border-white/[0.1] shadow-sm'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-white/[0.03]'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* AI Services Tab */}
          {activeTab === 'ai-services' && (
            <div className="space-y-6">
              {/* Azora Pilot Configuration */}
              <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] transition-all duration-300 hover:border-emerald-500/20">
                <div className="p-6 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Brain className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">Azora Pilot (Constitutional AI)</h3>
                      <Badge className={useAzoraPilot ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[11px]' : 'bg-white/[0.04] text-gray-400 border-white/[0.08] text-[11px]'}>
                        {useAzoraPilot ? 'Primary' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 ml-12">
                    Your constitutional AI assistant powered by Azora's own models. 
                    This ensures sovereignty and prevents external service dependencies.
                  </p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div>
                      <Label className="text-white font-medium">Use Azora Pilot as Primary AI</Label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        When enabled, Azora Pilot will be used as your main AI service
                      </p>
                    </div>
                    <Switch
                      checked={useAzoraPilot}
                      onCheckedChange={setUseAzoraPilot}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pilot-url" className="text-sm text-gray-300">Azora Pilot URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="pilot-url"
                        value={azoraPilotUrl}
                        onChange={(e) => setAzoraPilotUrl(e.target.value)}
                        placeholder="http://localhost:8000"
                        className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-emerald-500/30 focus:ring-emerald-500/10"
                      />
                      <Button 
                        onClick={checkAzoraPilotStatus} 
                        variant="outline"
                        className="border-white/[0.08] text-gray-300 hover:bg-white/[0.04] hover:text-white"
                      >
                        Test Connection
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    {getStatusIcon()}
                    <span className="text-sm text-gray-300">
                      Status: <span className={pilotStatus.status === 'connected' ? 'text-green-400' : pilotStatus.status === 'disconnected' ? 'text-red-400' : 'text-yellow-400'}>{pilotStatus.status}</span>
                      {pilotStatus.modelLoaded && <span className="text-emerald-400"> &bull; Model Loaded</span>}
                    </span>
                  </div>
                </div>
                <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/[0.04] blur-2xl" />
              </div>

              {/* BYOK Configuration */}
              <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] transition-all duration-300 hover:border-white/[0.12]">
                <div className="p-6 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                      <Key className="h-5 w-5 text-gray-300" />
                    </div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">Bring Your Own Keys (BYOK)</h3>
                      <Badge className="bg-white/[0.04] text-gray-400 border-white/[0.08] text-[11px]">Optional</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 ml-12">
                    Configure external AI services as fallback options. 
                    Your data remains sovereign - these are only used when Azora Pilot is unavailable.
                  </p>
                </div>
                <div className="p-6 space-y-5">
                  {/* Constitutional Notice */}
                  <div className="flex gap-3 p-4 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10">
                    <Shield className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-300">
                      <span className="text-emerald-400 font-medium">Constitutional Principle:</span> Your keys are stored locally and never sent to external services without your explicit consent. 
                      Azora Pilot remains your primary AI to ensure technological sovereignty.
                    </p>
                  </div>

                  {/* API Key Fields */}
                  {[
                    { id: 'openai', label: 'OpenAI API Key', placeholder: 'sk-...' },
                    { id: 'anthropic', label: 'Anthropic API Key', placeholder: 'claude-...' },
                    { id: 'elevenlabs', label: 'ElevenLabs API Key (Voice)', placeholder: '...' },
                  ].map((provider) => (
                    <div key={provider.id} className="space-y-2">
                      <Label htmlFor={`${provider.id}-key`} className="text-sm text-gray-300">{provider.label}</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`${provider.id}-key`}
                          type={showKeys[provider.id] ? "text" : "password"}
                          value={(apiKeys as Record<string, string>)[provider.id] || ''}
                          onChange={(e) => updateApiKey(provider.id, e.target.value)}
                          placeholder={provider.placeholder}
                          className="font-mono bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-white/20"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleKeyVisibility(provider.id)}
                          className="border-white/[0.08] text-gray-400 hover:bg-white/[0.04] shrink-0"
                        >
                          {showKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => testApiKey(provider.id, (apiKeys as Record<string, string>)[provider.id] || '')}
                          disabled={testingKeys[provider.id] || !(apiKeys as Record<string, string>)[provider.id]}
                          className="border-white/[0.08] text-gray-400 hover:bg-white/[0.04] shrink-0"
                        >
                          {testingKeys[provider.id] ? 'Testing...' : 'Test'}
                        </Button>
                      </div>
                      {testResults[provider.id] && (
                        <p className={`text-xs ${
                          testResults[provider.id].status === 'success' ? 'text-green-400' : 
                          testResults[provider.id].status === 'error' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {testResults[provider.id].message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Constitutional Tab */}
          {activeTab === 'constitutional' && (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] transition-all duration-300 hover:border-emerald-500/20">
                <div className="p-6 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Shield className="h-5 w-5 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white">Constitutional AI Settings</h3>
                  </div>
                  <p className="text-sm text-gray-400 ml-12">
                    Configure how Constitutional AI validates and governs system operations
                  </p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex gap-3 p-4 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10">
                    <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-300">
                      Constitutional AI ensures all operations align with Ubuntu principles, Truth as Currency, and service to humanity.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">Truth Score Threshold</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        defaultValue="95" 
                        className="bg-white/[0.03] border-white/[0.08] text-white focus:border-emerald-500/30" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">Constitutional Compliance</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        defaultValue="95" 
                        className="bg-white/[0.03] border-white/[0.08] text-white focus:border-emerald-500/30" 
                      />
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/[0.04] blur-2xl" />
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] transition-all duration-300 hover:border-white/[0.12]">
                <div className="p-6 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                      <Settings className="h-5 w-5 text-gray-300" />
                    </div>
                    <h3 className="font-semibold text-white">Advanced Configuration</h3>
                  </div>
                  <p className="text-sm text-gray-400 ml-12">
                    Advanced settings for power users and developers
                  </p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Tool Rate Limit (per minute)</Label>
                    <Input 
                      type="number" 
                      defaultValue="5" 
                      className="bg-white/[0.03] border-white/[0.08] text-white focus:border-white/20" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Max Context Length</Label>
                    <Input 
                      type="number" 
                      defaultValue="2000" 
                      className="bg-white/[0.03] border-white/[0.08] text-white focus:border-white/20" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-white/[0.06]">
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Settings saved successfully</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Failed to save settings</span>
              </div>
            )}
            <Button 
              onClick={saveSettings} 
              disabled={saving}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
