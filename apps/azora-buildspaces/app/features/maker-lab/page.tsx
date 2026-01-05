'use client'

import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Wrench,
  Lightbulb,
  Zap,
  TestTube,
  Rocket,
  GitBranch,
  Users,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MakerLabPage() {
  const router = useRouter()

  const features = [
    {
      icon: Lightbulb,
      title: "Idea Prototyping",
      description: "Rapidly prototype and test new ideas with minimal setup"
    },
    {
      icon: TestTube,
      title: "Experiment Sandbox",
      description: "Safe environment to experiment with new technologies and frameworks"
    },
    {
      icon: Zap,
      title: "Quick Setup",
      description: "Pre-configured environments for popular tech stacks and tools"
    },
    {
      icon: GitBranch,
      title: "Version Control",
      description: "Built-in Git integration for tracking prototype iterations"
    },
    {
      icon: Rocket,
      title: "Deployment Ready",
      description: "Easily deploy prototypes to staging or production environments"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share prototypes with team members for feedback and iteration"
    }
  ]

  const capabilities = [
    "Full-stack application prototyping",
    "API development and testing",
    "Database schema design",
    "Microservice architecture",
    "Third-party integrations",
    "Performance testing",
    "Security testing",
    "Scalability experiments",
    "New technology evaluation",
    "Proof-of-concept development"
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Wrench className="w-4 h-4" />
              <span>Maker Lab</span>
            </div>
            <h1 className="text-4xl font-bold mb-6">
              Rapid Prototyping Environment
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Transform ideas into working prototypes quickly. Experiment with new technologies,
              test concepts, and iterate rapidly in a sandboxed cloud environment.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push('/workspace')} className="gap-2">
                <Play className="w-4 h-4" />
                Open Maker Lab
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/demo-maker-lab')}>
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
            <h2 className="text-2xl font-bold mb-6 text-center">What You Can Prototype</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilities.map((capability, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{capability}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-muted/30 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Prototype?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Access the full Maker Lab in our integrated workspace.
                Start building and testing your ideas immediately.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" onClick={() => router.push('/workspace')} className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Enter Maker Lab
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
