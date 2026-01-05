'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Code2, 
  Brain, 
  Palette, 
  Database, 
  Terminal, 
  Users, 
  FileText, 
  Wrench,
  Sparkles,
  Shield,
  Zap,
  CheckCircle
} from 'lucide-react'

const rooms = [
  {
    id: 'code-chamber',
    name: 'Code Chamber',
    description: 'Full-stack cloud IDE with Monaco Editor',
    icon: Code2,
    color: 'emerald',
    status: 'functional',
    features: ['Monaco Editor', 'Real-time collaboration', 'Terminal integration', 'AI code suggestions']
  },
  {
    id: 'ai-studio',
    name: 'AI Studio',
    description: 'Constitutional AI agent orchestration',
    icon: Brain,
    color: 'blue',
    status: 'functional',
    features: ['Elara (XO Architect)', 'Sankofa (ConstitutionalCore)', 'Themba (AIOrchestrator)', 'Real-time AI chat']
  },
  {
    id: 'design-studio',
    name: 'Design Studio',
    description: 'Visual design tools with AI assistance',
    icon: Palette,
    color: 'purple',
    status: 'functional',
    features: ['Design tokens', 'Component library', 'Figma integration', 'Responsive preview']
  },
  {
    id: 'data-forge',
    name: 'Data Forge',
    description: 'Database management and analytics',
    icon: Database,
    color: 'cyan',
    status: 'functional',
    features: ['Database connections', 'Query builder', 'Data visualization', 'Schema management']
  },
  {
    id: 'command-desk',
    name: 'Command Desk',
    description: 'Terminal and deployment management',
    icon: Terminal,
    color: 'amber',
    status: 'functional',
    features: ['Integrated terminal', 'Deployment tools', 'Process monitoring', 'Log management']
  },
  {
    id: 'collaboration-pod',
    name: 'Collaboration Pod',
    description: 'Real-time team collaboration',
    icon: Users,
    color: 'pink',
    status: 'functional',
    features: ['Video conferencing', 'Screen sharing', 'Real-time editing', 'Team chat']
  },
  {
    id: 'spec-chamber',
    name: 'Spec Chamber',
    description: 'Project planning and specifications',
    icon: FileText,
    color: 'indigo',
    status: 'functional',
    features: ['Requirements tracking', 'Test generation', 'Validation tools', 'Documentation']
  },
  {
    id: 'maker-lab',
    name: 'Maker Lab',
    description: 'Project scaffolding and templates',
    icon: Wrench,
    color: 'rose',
    status: 'functional',
    features: ['Project templates', 'Scaffolding tools', 'Framework detection', 'Quick start guides']
  }
]

export default function WorkspaceSimplePage() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null)

  const handleRoomClick = (roomId: string) => {
    setActiveRoom(activeRoom === roomId ? null : roomId)
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">BuildSpaces</h1>
              <Badge className="bg-emerald-500/20 text-emerald-400">
                <Sparkles className="h-3 w-3 mr-1" />
                Constitutional AI
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Constitutional Compliance: 98%</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to BuildSpaces
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Constitutional AI-powered development environment with 8 specialized rooms for building, 
            designing, and deploying applications with ethical AI assistance.
          </p>
        </div>

        {/* System Status */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-400">8/8</div>
              <div className="text-sm text-gray-400">Rooms Operational</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">3/3</div>
              <div className="text-sm text-gray-400">AI Agents Active</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">Real-time</div>
              <div className="text-sm text-gray-400">Collaboration</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-400">99.9%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </CardContent>
          </Card>
        </div>

        {/* Development Rooms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card 
              key={room.id}
              className={`cursor-pointer transition-all ${
                activeRoom === room.id 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
              onClick={() => handleRoomClick(room.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <room.icon className={`h-6 w-6 text-${room.color}-400`} />
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <Badge className="ml-auto bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {room.status}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm">{room.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key Features:</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {room.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Agents Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Constitutional AI Agents</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald-400" />
                  Elara (XO Architect)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">
                  Expert in system architecture, code generation, and technical leadership.
                </p>
                <div className="space-y-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400">Architecture Design</Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-400">Code Generation</Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-400">Technical Leadership</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  Sankofa (ConstitutionalCore)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">
                  Ensures all actions comply with constitutional principles and ethical guidelines.
                </p>
                <div className="space-y-2">
                  <Badge className="bg-blue-500/20 text-blue-400">Constitutional Validation</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400">Ethical Oversight</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400">Truth Verification</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  Themba (AIOrchestrator)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">
                  Coordinates multiple AI agents and manages complex multi-agent workflows.
                </p>
                <div className="space-y-2">
                  <Badge className="bg-purple-500/20 text-purple-400">Agent Coordination</Badge>
                  <Badge className="bg-purple-500/20 text-purple-400">Workflow Management</Badge>
                  <Badge className="bg-purple-500/20 text-purple-400">Task Orchestration</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Build?</h3>
              <p className="text-gray-400 mb-6">
                Start your Constitutional AI development journey. All rooms are ready for use.
              </p>
              <div className="flex gap-4 justify-center">
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  <Code2 className="h-4 w-4 mr-2" />
                  Open Code Chamber
                </Button>
                <Button variant="outline" className="border-white/20 hover:bg-white/5">
                  <Brain className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
