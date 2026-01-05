'use client'

import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Palette,
  Layout,
  Component,
  Figma,
  Code2,
  Zap,
  Users,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DesignStudioPage() {
  const router = useRouter()

  const features = [
    {
      icon: Figma,
      title: "Figma Integration",
      description: "Import designs directly from Figma and convert to React components"
    },
    {
      icon: Component,
      title: "Component Library",
      description: "Build and manage reusable UI components with TypeScript support"
    },
    {
      icon: Layout,
      title: "Layout Systems",
      description: "Create responsive layouts with CSS Grid, Flexbox, and Tailwind CSS"
    },
    {
      icon: Code2,
      title: "Design-to-Code",
      description: "Convert designs to production-ready code with AI assistance"
    },
    {
      icon: Users,
      title: "Design Collaboration",
      description: "Share designs, get feedback, and collaborate with your team"
    },
    {
      icon: Zap,
      title: "Rapid Prototyping",
      description: "Quickly iterate on designs with hot-reload and live preview"
    }
  ]

  const capabilities = [
    "UI/UX design systems",
    "Component development",
    "Responsive design",
    "Design token management",
    "Figma to React conversion",
    "Style guide generation",
    "Accessibility compliance",
    "Cross-platform design",
    "Animation and transitions",
    "Design system documentation"
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Palette className="w-4 h-4" />
              <span>Design Studio</span>
            </div>
            <h1 className="text-4xl font-bold mb-6">
              Design Systems & Components
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Create beautiful, consistent design systems and convert them to production-ready
              React components. From Figma to code with AI-powered assistance.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push('/workspace')} className="gap-2">
                <Play className="w-4 h-4" />
                Open Design Studio
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/demo-design-studio')}>
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
            <h2 className="text-2xl font-bold mb-6 text-center">What You Can Create</h2>
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
              <h2 className="text-2xl font-bold mb-4">Ready to Design?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Access the full Design Studio in our integrated workspace.
                Import from Figma, build components, and ship design systems.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" onClick={() => router.push('/workspace')} className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Enter Design Studio
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
