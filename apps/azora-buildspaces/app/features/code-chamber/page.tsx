'use client'

import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Code2,
  Terminal,
  GitBranch,
  Users,
  Wand2,
  Zap,
  Cloud,
  Shield,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CodeChamberPage() {
  const router = useRouter()

  const features = [
    {
      icon: Code2,
      title: "Monaco Editor",
      description: "Professional code editing with syntax highlighting, IntelliSense, and advanced features"
    },
    {
      icon: Terminal,
      title: "Integrated Terminal",
      description: "Full shell access with PTY support, connected to your cloud workspace"
    },
    {
      icon: GitBranch,
      title: "Git Integration",
      description: "Version control, branching, and collaboration workflows built-in"
    },
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "Yjs-powered collaborative editing with awareness and conflict resolution"
    },
    {
      icon: Wand2,
      title: "AI Assistance",
      description: "Elara AI agent provides code suggestions, refactoring, and intelligent help"
    },
    {
      icon: Cloud,
      title: "Cloud Workspace",
      description: "Persistent file system with auto-save and cross-device synchronization"
    }
  ]

  const capabilities = [
    "TypeScript/JavaScript development",
    "React/Next.js applications",
    "Node.js backend services",
    "Database integrations",
    "API development and testing",
    "Real-time collaboration",
    "AI-powered code generation",
    "Terminal operations",
    "Git version control",
    "Package management"
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Code2 className="w-4 h-4" />
              <span>Code Chamber</span>
            </div>
            <h1 className="text-4xl font-bold mb-6">
              Professional Cloud IDE
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Experience GitHub Codespaces-level development with AI assistance, real-time collaboration,
              and seamless terminal integration. Build full-stack applications in the cloud.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push('/workspace')} className="gap-2">
                <Play className="w-4 h-4" />
                Open Workbench
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/demo-code-chamber')}>
                Try Demo
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, i) => (
              <Card key={i} className="border-border/50">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Capabilities */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">What You Can Build</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilities.map((capability, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{capability}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specs */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Editor Features</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Monaco Editor (VS Code engine)</li>
                    <li>• TypeScript/JavaScript support</li>
                    <li>• IntelliSense and auto-completion</li>
                    <li>• Multi-cursor editing</li>
                    <li>• Find & replace with regex</li>
                    <li>• Bracket matching & folding</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Collaboration</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Real-time collaborative editing</li>
                    <li>• Yjs CRDT for conflict resolution</li>
                    <li>• User presence indicators</li>
                    <li>• Live cursors and selections</li>
                    <li>• Operational transformation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-muted/30 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Coding?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Access the full Code Chamber experience in our integrated workspace.
                No setup required - everything runs in the cloud with persistent storage.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" onClick={() => router.push('/workspace')} className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Enter Code Chamber
                </Button>
                <Link href="/features" className="text-muted-foreground hover:text-foreground">
                  View All Features →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
