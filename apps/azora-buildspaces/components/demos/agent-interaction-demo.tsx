"use client"

/**
 * Agent Interaction Demo
 * 
 * Demonstrates the full constitutional flow:
 * 1. User asks agent for help
 * 2. Request validated by Constitutional Guard
 * 3. Agent processes request
 * 4. Response returned with constitutional check
 */

import React, { useState } from 'react'
import { useElara, useThemba, useJabari } from '@/lib/hooks/use-agent'
import type { AgentSignal } from '@/lib/agent-bridge'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { getConstitutionalHealth } from '@/lib/constitutional-guard'
import { Button } from '@/components/ui/button'
import { AfricanAgentAvatar } from '@/components/ui/african-agent-avatar'
import { Shield, Activity, Code, FileText, Bug, Sparkles, AlertTriangle } from 'lucide-react'

export function AgentInteractionDemo() {
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<'Elara' | 'Themba' | 'Jabari'>('Elara')
  const [selectedSignal, setSelectedSignal] = useState<AgentSignal>('REVIEW_CODE')

  // Use agent hooks
  const elara = useElara({
    onResponse: (res) => {
      console.log('Elara responded:', res)
    },
  })
  const themba = useThemba()
  const jabari = useJabari()

  // Get current agent hook
  const currentAgent =
    selectedAgent === 'Elara' ? elara : selectedAgent === 'Themba' ? themba : jabari

  // Workspace context
  const { activeFile, constitutionalHealth, currentRoom, activeAgents } = useWorkspaceStore()
  
  // Constitutional health metrics
  const healthMetrics = getConstitutionalHealth()

  const handleAsk = async () => {
    if (!input.trim()) return

    await currentAgent.askAgent(selectedSignal, input)
    setInput('')
  }

  const signals: { value: AgentSignal; label: string; icon: any }[] = [
    { value: 'REVIEW_CODE', label: 'Review Code', icon: Code },
    { value: 'GENERATE_SPEC', label: 'Generate Spec', icon: FileText },
    { value: 'FIX_BUG', label: 'Fix Bug', icon: Bug },
    { value: 'SECURITY_AUDIT', label: 'Security Audit', icon: Shield },
  ]

  return (
    <div className="h-full p-6 bg-[#1e1e1e] text-white overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Agent Interaction Demo</h1>
          <p className="text-gray-400">
            Full Constitutional AI Flow - Validated, Transparent, Safe
          </p>
        </div>

        {/* Constitutional Health Panel */}
        <div className="bg-[#252526] rounded-lg border border-emerald-500/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold">Constitutional Health</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Current Score</p>
              <p className="text-2xl font-bold text-emerald-400">{constitutionalHealth}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold">{healthMetrics.totalRequests}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Passed</p>
              <p className="text-2xl font-bold text-green-400">{healthMetrics.passedRequests}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg Score</p>
              <p className="text-2xl font-bold">{healthMetrics.averageHealthScore}</p>
            </div>
          </div>
        </div>

        {/* Context Panel */}
        <div className="bg-[#252526] rounded-lg border border-[#3e3e42] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Workspace Context</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Current Room</p>
              <p className="text-white font-medium">{currentRoom}</p>
            </div>
            <div>
              <p className="text-gray-400">Active Agents</p>
              <p className="text-white font-medium">{activeAgents.join(', ')}</p>
            </div>
            <div>
              <p className="text-gray-400">Active File</p>
              <p className="text-white font-medium truncate">
                {activeFile ? activeFile.path : 'None'}
              </p>
            </div>
            <div>
              <p className="text-gray-400">File Lines</p>
              <p className="text-white font-medium">
                {activeFile ? activeFile.content.split('\n').length : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Agent Selection */}
        <div className="bg-[#252526] rounded-lg border border-[#3e3e42] p-4">
          <h2 className="text-lg font-semibold mb-3">Select Agent</h2>
          <div className="flex gap-3">
            {(['Elara', 'Themba', 'Jabari'] as const).map(agent => (
              <button
                key={agent}
                onClick={() => setSelectedAgent(agent)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  selectedAgent === agent
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-[#3e3e42] hover:bg-white/5 text-gray-400'
                }`}
              >
                <AfricanAgentAvatar agent={agent.toLowerCase() as any} size="sm" showGlow={false} showAura={false} />
                <span className="font-medium">{agent}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Signal Selection */}
        <div className="bg-[#252526] rounded-lg border border-[#3e3e42] p-4">
          <h2 className="text-lg font-semibold mb-3">Select Action</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {signals.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSelectedSignal(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  selectedSignal === value
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-[#3e3e42] hover:bg-white/5 text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-[#252526] rounded-lg border border-[#3e3e42] p-4">
          <h2 className="text-lg font-semibold mb-3">Ask {selectedAgent}</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="Describe what you need help with..."
              className="flex-1 bg-[#3c3c3c] border border-[#3e3e42] rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
            <Button
              onClick={handleAsk}
              disabled={currentAgent.isLoading || !input.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {currentAgent.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ask
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Response Area */}
        {currentAgent.response && (
          <div className="bg-[#252526] rounded-lg border border-[#3e3e42] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Response</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentAgent.response.status === 'success'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {currentAgent.response.status}
              </span>
            </div>

            {/* Constitutional Check */}
            <div className={`mb-4 p-3 rounded-lg border ${
              currentAgent.response.constitutionalCheck.passed
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-red-500/30 bg-red-500/10'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {currentAgent.response.constitutionalCheck.passed ? (
                  <Shield className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
                <span className="font-medium">
                  Constitutional Check:{' '}
                  {currentAgent.response.constitutionalCheck.passed ? 'PASSED' : 'FAILED'}
                </span>
                <span className="ml-auto text-sm">
                  Health: {currentAgent.response.constitutionalCheck.healthScore}/100
                </span>
              </div>
              {currentAgent.response.constitutionalCheck.violations.length > 0 && (
                <div className="text-sm space-y-1">
                  {currentAgent.response.constitutionalCheck.violations.map((v, i) => (
                    <div key={i} className="text-red-300">
                      • {v.message} (Severity: {v.severity}/10)
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Response Content */}
            {currentAgent.response.data && (
              <div className="bg-[#1e1e1e] rounded p-4 text-gray-300 whitespace-pre-wrap font-mono text-sm">
                {currentAgent.response.data.result}
              </div>
            )}

            {/* Error */}
            {currentAgent.response.error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-4 text-red-300">
                {currentAgent.response.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
