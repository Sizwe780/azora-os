/**
 * Spark Input Component
 * The "Prompt First" UI for natural language app generation
 * 
 * Constitutional Compliance:
 * - UBUNTU: Intuitive interface accessible to all skill levels
 * - TRUTH: Real-time feedback on generation progress
 * 
 * Large central prompt box with mode switcher for Micro-App vs Full-Stack
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles, Zap, Database, Loader2 } from 'lucide-react'
import { AppMode } from '@/lib/engines/spark-generator'

interface SparkInputProps {
  onGenerate: (prompt: string, mode: AppMode) => Promise<void>
  isGenerating: boolean
  placeholder?: string
}

const EXAMPLE_PROMPTS = [
  'Build a personal CRM with a dark mode dashboard and a contacts table',
  'Create a calorie tracker with food entries and daily totals',
  'Make a todo list app with categories and due dates',
  'Build a simple blog with posts and comments',
  'Create a weather dashboard showing current conditions',
]

export function SparkInput({
  onGenerate,
  isGenerating,
  placeholder = 'What do you want to build?',
}: SparkInputProps) {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState<AppMode>('micro-app')

  const handleSubmit = async () => {
    if (!prompt.trim() || isGenerating) return
    await onGenerate(prompt, mode)
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Spark Engine</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Natural Language → Working App
            </span>
          </div>
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <Label htmlFor="mode-select" className="text-sm text-muted-foreground">
              Mode:
            </Label>
            <Select value={mode} onValueChange={(value) => setMode(value as AppMode)}>
              <SelectTrigger id="mode-select" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="micro-app">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Micro-App</span>
                  </div>
                </SelectItem>
                <SelectItem value="full-stack">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>Full-Stack</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mode Description */}
        <div className="mt-3 text-xs text-muted-foreground">
          {mode === 'micro-app' ? (
            <p>
              ⚡ <strong>Micro-App:</strong> React + Vite, client-side only, fastest generation
            </p>
          ) : (
            <p>
              🗄️ <strong>Full-Stack:</strong> Next.js + Prisma, includes database support
            </p>
          )}
        </div>
      </div>

      {/* Main Prompt Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-3xl space-y-4">
          {/* Large Prompt Box */}
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[200px] text-lg p-6 resize-none focus:ring-2 focus:ring-purple-500 border-2"
              disabled={isGenerating}
              aria-label="App description prompt"
              autoFocus
            />
            <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd> +{' '}
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to generate
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isGenerating}
              size="lg"
              className="gap-2 px-8 py-6 text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate App
                </>
              )}
            </Button>
          </div>

          {/* Example Prompts */}
          {!isGenerating && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Or try an example:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="text-xs hover:border-purple-500 hover:text-purple-600"
                  >
                    {example.length > 50 ? `${example.slice(0, 50)}...` : example}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Status Badges */}
          {!isGenerating && (
            <div className="flex gap-2 justify-center mt-6">
              <Badge variant="secondary" className="gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Kwame Online
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Runtime Ready
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="px-6 py-4 border-t bg-muted/10">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground">
            <strong>💡 Tip:</strong> Be specific about features, layout, and functionality. 
            Mention colors, styles, or data structures for better results.
          </p>
        </div>
      </div>
    </div>
  )
}
