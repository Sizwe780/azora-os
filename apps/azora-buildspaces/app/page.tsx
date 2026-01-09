'use client'

import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { AfricanAgentAvatar, agentStyles } from "@/components/ui/african-agent-avatar"
import { CopilotAgentAvatar, CopilotAgentShowcase } from "@/components/ui/copilot-agent-avatar"
import { LiveRoomGrid } from "@/components/ui/live-room-card"
import { CitadelLogo } from "@/components/ui/citadel-logo"
import { Button } from "@/components/ui/button"
import { CodeChamber } from "@/components/demo/code-chamber-demo"
import Link from "next/link"
import {
  ArrowRight,
  Play,
  Code2,
  FileText,
  Palette,
  Brain,
  Terminal,
  Wrench,
  Users,
  Check,
  Sparkles,
  Shield,
  Zap,
  GitBranch,
} from "lucide-react"

const features = [
  {
    icon: Code2,
    title: "Code Chamber",
    desc: "Full-stack cloud IDE",
    color: "emerald",
    href: "/features/code-chamber",
  },
  {
    icon: FileText,
    title: "Spec Chamber",
    desc: "Requirements & validation",
    color: "blue",
    href: "/features/spec-chamber",
  },
  { icon: Palette, title: "Design Studio", desc: "Figma to React", color: "purple", href: "/features/design-studio" },
  { icon: Brain, title: "AI Studio", desc: "Agent orchestration", color: "pink", href: "/features/ai-studio" },
  { icon: Terminal, title: "Command Desk", desc: "Slash commands", color: "amber", href: "/features/command-desk" },
  { icon: Wrench, title: "Maker Lab", desc: "Full-stack scaffolding", color: "rose", href: "/features/maker-lab" },
  {
    icon: Users,
    title: "Collaboration Pod",
    desc: "Real-time teamwork",
    color: "cyan",
    href: "/features/collaboration-pod",
  },
  {
    icon: Sparkles,
    title: "Knowledge Ocean",
    desc: "AI-powered search & insights",
    color: "indigo",
    href: "/features/knowledge-ocean",
  },
]

const stats = [
  { value: "Real-time", label: "Collaboration", icon: Users },
  { value: "Git", label: "Integrated", icon: GitBranch },
  { value: "Monaco", label: "Editor", icon: Code2 },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <AetherBackground intensity="high" showParticles />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Powered by Constitutional AI badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Powered by Constitutional AI</span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
                <span className="text-white">Build with</span>{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  AI Agents
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 text-pretty">
                Elara orchestrates specialized AI agents across 8 interconnected rooms to transform your vision into production-ready code. From concept to deployment in minutes, not months.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 text-lg">
                  <Link href="/auth/signup">
                    Start Building <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-white/20 hover:bg-white/5 px-8 py-4 text-lg bg-transparent">
                  <Play className="mr-2 h-5 w-5" /> Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-8 text-sm text-gray-400">
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <stat.icon className="h-4 w-4 text-emerald-400" />
                    <span className="font-medium text-white">{stat.value}</span>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Code Chamber Preview */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-emerald-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
              <CodeChamber />
            </div>
          </div>
        </section>

        {/* AI Workflow Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                From idea to{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  production
                </span>{" "}
                in minutes
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Just describe what you want to build. Elara and the team handle the rest.
              </p>
            </div>

            {/* Workflow Demo */}
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl border border-white/10 bg-[#161b22] overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
                  <CitadelLogo size="sm" />
                  <span className="font-medium">BuildSpaces Workspace</span>
                  <span className="text-gray-500 text-sm">Elara is ready to build</span>
                  <div className="ml-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-400 bg-transparent"
                    >
                      <Play className="h-4 w-4 mr-1" /> Live Demo
                    </Button>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-6 space-y-4">
                  {[
                    { text: "Create a dashboard with user analytics", done: true },
                    { text: "Add authentication with social login", done: true },
                    { text: "Build a real-time notification system", inProgress: true },
                    { text: "Deploy to production", pending: true },
                  ].map((task, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 rounded-xl p-4 ${task.inProgress ? "bg-white/5 border border-emerald-500/30" : "bg-white/[0.02]"}`}
                    >
                      <div
                        className={`flex items-center justify-center h-8 w-8 rounded-full ${task.done ? "bg-emerald-500" : task.inProgress ? "bg-emerald-500/20 border border-emerald-500" : "bg-white/10"}`}
                      >
                        {task.done ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : task.inProgress ? (
                          <AfricanAgentAvatar agent="elara" size="sm" showAura={false} showGlow={false} />
                        ) : (
                          <span className="text-xs text-gray-500">{i + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={task.pending ? "text-gray-500" : "text-white"}>{task.text}</p>
                        {task.inProgress && (
                          <p className="text-sm text-emerald-400 flex items-center gap-1 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Elara is coordinating agents...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-6 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Describe what you want to build..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none"
                    />
                    <Button className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3">
                      <Sparkles className="h-4 w-4 mr-2" /> Build
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* The 8 Rooms - Live Status */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">The 8 Rooms</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Eight interconnected environments with live agent activity. Watch your AI team work in real-time.
              </p>
            </div>

            <LiveRoomGrid />
          </div>
        </section>

        {/* Meet the Agents - Copilot Style */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Meet Your AI Team</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                African Android humanoids with 3D presence that follows your cursor. Powered by Constitutional AI for safe, reliable assistance.
              </p>
            </div>

            <CopilotAgentShowcase />

            <div className="mt-12 text-center">
              <Button asChild variant="outline" className="border-white/20 hover:bg-white/5 bg-transparent">
                <Link href="/features/agents">
                  Learn more about agents <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border border-emerald-500/30 p-12 text-center overflow-hidden">
              <AetherBackground intensity="low" showParticles={false} />
              <div className="relative">
                <CitadelLogo size="lg" className="mx-auto mb-6" />
                <h2 className="text-4xl font-bold mb-4">Ready to enter the Citadel?</h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  Join thousands of developers building the future with AI-powered development tools.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild className="bg-emerald-500 hover:bg-emerald-600 px-8 py-4 text-lg">
                    <Link href="/features/code-chamber">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/20 hover:bg-white/5 px-8 py-4 text-lg bg-transparent"
                  >
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
