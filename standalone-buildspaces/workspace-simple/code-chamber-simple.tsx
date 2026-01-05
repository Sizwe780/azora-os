'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Code2, 
  Play, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Bot, 
  Users, 
  Wifi, 
  WifiOff,
  Terminal,
  FileText,
  FolderOpen,
  Plus,
  X
} from 'lucide-react'

const sampleFiles = [
  { name: 'app/page.tsx', content: `export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold">Hello BuildSpaces!</h1>
      <p>Constitutional AI-powered development</p>
    </div>
  )
}`, language: 'typescript' },
  { name: 'components/Button.tsx', content: `interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded font-medium transition-colors"
  const variantClasses = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white"
  }

  return (
    <button 
      className={\`\${baseClasses} \${variantClasses[variant]}\`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}`, language: 'typescript' },
  { name: 'styles/globals.css', content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 220 16% 4%;
  --foreground: 210 20% 98%;
  --primary: 165 80% 50%;
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}`, language: 'css' }
]

export function CodeChamberSimple() {
  const [activeFile, setActiveFile] = useState(sampleFiles[0])
  const [code, setCode] = useState(sampleFiles[0].content)
  const [isConnected, setIsConnected] = useState(true)
  const [collaborators] = useState(['Alice', 'Bob'])
  const [aiTyping, setAiTyping] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)

  const handleFileSelect = (file: typeof sampleFiles[0]) => {
    setActiveFile(file)
    setCode(file.content)
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  const handleSave = () => {
    // Simulate save operation
    console.log('Saving file:', activeFile.name, code)
  }

  const handleRun = () => {
    // Simulate running the code
    console.log('Running code...', code)
  }

  const handleAiSuggestion = () => {
    setAiTyping(true)
    setTimeout(() => {
      setAiSuggestion("// Elara suggests: Add error handling for better UX")
      setAiTyping(false)
    }, 2000)
  }

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'typescript': return 'text-blue-400'
      case 'css': return 'text-pink-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#0d1117] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-emerald-400" />
              <h1 className="font-semibold">Code Chamber</h1>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400">
              Constitutional AI
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Collaboration Status */}
            <div className="flex items-center gap-2">
              {collaborators.length > 0 && (
                <div className="flex items-center gap-1 text-green-400">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{collaborators.length + 1}</span>
                </div>
              )}
              <div className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
                {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span className="text-sm">{isConnected ? 'Connected' : 'Offline'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm" onClick={handleRun}>
                <Play className="h-4 w-4 mr-1" />
                Run
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-white/5">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Files</h3>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-2">
            {sampleFiles.map((file) => (
              <div
                key={file.name}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                  activeFile.name === file.name 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'hover:bg-white/5'
                }`}
                onClick={() => handleFileSelect(file)}
              >
                <FileText className={`h-4 w-4 ${getLanguageColor(file.language)}`} />
                <span className="text-sm">{file.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* File Tab */}
          <div className="flex items-center border-b border-white/10 bg-muted/30 px-4 py-2">
            <div className="flex items-center gap-2">
              <FileText className={`h-4 w-4 ${getLanguageColor(activeFile.language)}`} />
              <span className="text-sm">{activeFile.name}</span>
            </div>
          </div>

          {/* AI Suggestion Banner */}
          {(aiTyping || aiSuggestion) && (
            <div className="border-b border-primary/20 bg-primary/5 px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-background" />
                </div>
                {aiTyping ? (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <span>Elara is analyzing</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </span>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-foreground">{aiSuggestion}</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="h-6 px-2 text-xs">
                        Accept
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setAiSuggestion(null)}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Code Editor */}
          <div className="flex-1 p-4">
            <Textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full h-full min-h-0 font-mono text-sm bg-black/20 border-white/10 resize-none"
              placeholder="Start coding with Constitutional AI assistance..."
            />
          </div>

          {/* Bottom Panel */}
          <div className="border-t border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button size="sm" variant="outline" onClick={handleAiSuggestion}>
                  <Bot className="h-4 w-4 mr-1" />
                  Ask Elara
                </Button>
                <Button size="sm" variant="outline">
                  <Terminal className="h-4 w-4 mr-1" />
                  Terminal
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Ln 1, Col 1</span>
                <span>{activeFile.language}</span>
                <span>UTF-8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="w-80 border-l border-white/10 bg-white/5">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-medium flex items-center gap-2">
              <Bot className="h-4 w-4 text-emerald-400" />
              AI Assistant
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            <Card className="bg-emerald-500/10 border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Elara (XO Architect)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-400 mb-3">
                  Ready to help with architecture, code generation, and technical decisions.
                </p>
                <div className="space-y-2">
                  <Button size="sm" className="w-full text-xs">
                    Generate Component
                  </Button>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Review Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sankofa (ConstitutionalCore)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-400 mb-3">
                  Ensuring constitutional compliance and ethical AI practices.
                </p>
                <div className="space-y-2">
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    ✓ Constitution Validated
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-500/10 border-purple-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Themba (AIOrchestrator)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-400 mb-3">
                  Coordinating multi-agent workflows and task orchestration.
                </p>
                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Run Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
