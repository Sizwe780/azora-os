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
  BarChart3,
} from "lucide-react"

const features = [
  {
    icon: Code2,
    title: "Code Chamber",
    desc: "Professional cloud IDE with AI assistance, code analysis, performance profiling, and live collaboration",
    color: "emerald",
    href: "/features/code-chamber",
    advanced: ["AI Code Assistant", "Real-time Code Analysis", "Performance Profiling", "Live Collaboration", "Git Integration"]
  },
  {
    icon: FileText,
    title: "Spec Chamber",
    desc: "Enterprise-grade specification management with AI assistance, automated review, and compliance tracking",
    color: "blue",
    href: "/features/spec-chamber",
    advanced: ["AI Spec Generation", "Automated Reviews", "Compliance Tracking", "Team Collaboration", "Version Control"]
  },
  { icon: Palette, title: "Design Studio", desc: "Advanced design-to-code workflow with Figma integration, prototyping, and design systems", color: "purple", href: "/features/design-studio", advanced: ["Figma Integration", "Interactive Prototyping", "Design Systems", "Version History", "Team Collaboration"] },
  { icon: Brain, title: "AI Studio", desc: "Multi-agent orchestration platform with constitutional AI governance and task automation", color: "pink", href: "/features/ai-studio", advanced: ["Constitutional AI", "Agent Orchestration", "Task Automation", "Safety Protocols", "Real-time Monitoring"] },
  { icon: Terminal, title: "Command Desk", desc: "Intelligent command interface with natural language processing and multi-agent coordination", color: "amber", href: "/features/command-desk", advanced: ["Natural Language", "Multi-Agent Coordination", "Context Awareness", "Command History", "Smart Suggestions"] },
  { icon: Wrench, title: "Maker Lab", desc: "Full-stack hardware prototyping with IoT simulation, circuit design, and embedded development", color: "rose", href: "/features/maker-lab", advanced: ["IoT Simulation", "Circuit Design", "Embedded Development", "Hardware Testing", "Cloud Deployment"] },
  {
    icon: Shield,
    title: "Constitutional AI",
    desc: "African Ubuntu-based AI governance ensuring ethical, safe, and beneficial AI interactions",
    color: "indigo",
    href: "/features/constitutional-ai",
    advanced: ["Ubuntu Principles", "Ethical Governance", "Safety Protocols", "Transparency", "Human Oversight"]
  },
  {
    icon: GitBranch,
    title: "Live Collaboration",
    desc: "Real-time multi-user editing, cursor tracking, and seamless team workflows",
    color: "cyan",
    href: "/features/collaboration",
    advanced: ["Real-time Editing", "Cursor Tracking", "Voice Chat", "Screen Sharing", "Conflict Resolution"]
  },
]

const stats = [
  { value: "Professional", label: "Cloud IDE", icon: Code2 },
  { value: "AI-Powered", label: "Development", icon: Sparkles },
  { value: "Real-time", label: "Collaboration", icon: Users },
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

            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6">
                <CitadelLogo size="lg" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                The Future of
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Software Development
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience the most advanced cloud development environment with AI-powered coding assistance,
                real-time collaboration, integrated Git workflows, and enterprise-grade security.
                Build faster with professional tools designed for modern development teams.
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

        {/* Professional Features Showcase */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Professional Development
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Environment
                </span>
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg">
                Built for enterprise teams with advanced collaboration, AI assistance, and cloud-native workflows.
                Everything you need to build production applications at scale.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* AI-Powered Development */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Sparkles className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold">AI-Powered Development</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    Intelligent code completion
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    Automated code reviews
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    Performance optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    Bug detection & fixes
                  </li>
                </ul>
              </div>

              {/* Real-time Collaboration */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Real-time Collaboration</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400" />
                    Live cursor tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400" />
                    Voice & video calls
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400" />
                    Conflict-free editing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-400" />
                    Shared terminals
                  </li>
                </ul>
              </div>

              {/* Enterprise Security */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Shield className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Enterprise Security</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-indigo-400" />
                    End-to-end encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-indigo-400" />
                    SSO integration
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-indigo-400" />
                    Audit trails
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-indigo-400" />
                    Compliance ready
                  </li>
                </ul>
              </div>

              {/* Cloud-Native Workflows */}
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Zap className="h-6 w-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Cloud Workflows</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-400" />
                    GitHub Actions integration
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-400" />
                    Auto-scaling environments
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-400" />
                    One-click deployments
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-400" />
                    Environment management
                  </li>
                </ul>
              </div>

              {/* Advanced Code Analysis */}
              <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-500/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Code Analysis</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-400" />
                    Real-time linting
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-400" />
                    Performance profiling
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-400" />
                    Security scanning
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-400" />
                    Code quality metrics
                  </li>
                </ul>
              </div>

              {/* Multi-Platform Support */}
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Code2 className="h-6 w-6 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Multi-Platform</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-pink-400" />
                    Web applications
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-pink-400" />
                    Mobile development
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-pink-400" />
                    IoT & embedded
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-pink-400" />
                    API development
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
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
