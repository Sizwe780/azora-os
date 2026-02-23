'use client'

import { useState, useEffect, useRef } from "react"
import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import { CopilotAgentShowcase } from "@/components/ui/copilot-agent-avatar"
import { LiveRoomGrid } from "@/components/ui/live-room-card"
import { CitadelLogo } from "@/components/ui/citadel-logo"
import { Button } from "@/components/ui/button"
import { HeroIDEDemo } from "@/components/demo/hero-ide-demo"
import Link from "next/link"
import {
  ArrowRight,
  Play,
  Code2,
  FileText,
  Palette,
  Sparkles,
  Shield,
  Rocket,
  Bot,
  Layers,
  Globe,
  CheckCircle2,
} from "lucide-react"

// ─── Morphing headline words ──────────────────────────────────
const morphWords = ["Code", "Design", "Deploy", "Scale", "Create"]

function MorphingHeadline() {
  const [wordIndex, setWordIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % morphWords.length)
        setIsVisible(true)
      }, 400)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05]">
      <span className="text-white">Where ideas</span>
      <br />
      <span className="text-white">become </span>
      <span
        className={`inline-block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-400 ${isVisible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-3 blur-sm"}`}
      >
        {morphWords[wordIndex]}
      </span>
    </h1>
  )
}

// ─── Animated counter ─────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 2000
          const start = Date.now()
          const tick = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        {count}{suffix}
      </div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  )
}

// ─── Tabbed features ──────────────────────────────────────────
const featureTabs = [
  {
    id: "code",
    label: "Code",
    icon: Code2,
    color: "emerald",
    title: "Code Chamber",
    subtitle: "A full VS Code-class cloud IDE with AI copilot built in",
    features: ["Monaco editor with IntelliSense", "Integrated terminal & debugger", "Git version control", "Elara AI pair programming", "Live multi-cursor collaboration"],
    visual: "code",
  },
  {
    id: "spec",
    label: "Spec",
    icon: FileText,
    color: "blue",
    title: "Spec Chamber",
    subtitle: "Turn requirements into validated, trackable specifications",
    features: ["AI-powered spec generation", "Automated compliance checks", "Version-controlled documents", "Stakeholder review workflows", "Export to any format"],
    visual: "spec",
  },
  {
    id: "design",
    label: "Design",
    icon: Palette,
    color: "purple",
    title: "Design Studio",
    subtitle: "Design-to-code pipeline with Figma sync and prototyping",
    features: ["Figma import & sync", "Interactive prototyping", "Design token management", "Component library builder", "Responsive preview"],
    visual: "design",
  },
  {
    id: "deploy",
    label: "Deploy",
    icon: Rocket,
    color: "amber",
    title: "Instant Deployment",
    subtitle: "One-click deploy to any cloud with CI/CD built in",
    features: ["GitHub Actions integration", "Auto-scaling environments", "Preview deployments", "Rollback in seconds", "Multi-region support"],
    visual: "deploy",
  },
  {
    id: "agents",
    label: "Agents",
    icon: Bot,
    color: "pink",
    title: "AI Agent Orchestration",
    subtitle: "A team of specialized AI agents working together on your project",
    features: ["8 specialized agents", "Constitutional AI governance", "Autonomous task execution", "Real-time agent activity", "Ubuntu ethics framework"],
    visual: "agents",
  },
]

const colorMap: Record<string, { tab: string; tabActive: string; border: string; bg: string; text: string; dot: string }> = {
  emerald: { tab: "text-gray-400 hover:text-emerald-400", tabActive: "text-emerald-400 border-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  blue:    { tab: "text-gray-400 hover:text-blue-400",    tabActive: "text-blue-400 border-blue-400",       border: "border-blue-500/20",    bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-400" },
  purple:  { tab: "text-gray-400 hover:text-purple-400",  tabActive: "text-purple-400 border-purple-400",   border: "border-purple-500/20",  bg: "bg-purple-500/10",  text: "text-purple-400",  dot: "bg-purple-400" },
  amber:   { tab: "text-gray-400 hover:text-amber-400",   tabActive: "text-amber-400 border-amber-400",     border: "border-amber-500/20",   bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-400" },
  pink:    { tab: "text-gray-400 hover:text-pink-400",    tabActive: "text-pink-400 border-pink-400",       border: "border-pink-500/20",    bg: "bg-pink-500/10",    text: "text-pink-400",    dot: "bg-pink-400" },
}

function FeatureTabVisual({ tabId, color }: { tabId: string; color: string }) {
  const colors = colorMap[color]
  const visuals: Record<string, React.ReactNode> = {
    code: (
      <div className="rounded-lg bg-[#161b22] border border-white/[0.06] overflow-hidden h-full">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06] bg-[#0d1117]">
          <div className="flex gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/60" /></div>
          <span className="text-[10px] text-gray-500 ml-2 font-mono">dashboard.tsx</span>
        </div>
        <div className="p-3 font-mono text-[11px] leading-relaxed space-y-0.5">
          <div><span className="text-gray-600 mr-3">1</span><span className="text-purple-300">import</span> <span className="text-cyan-300">{'{ Dashboard }'}</span> <span className="text-purple-300">from</span> <span className="text-green-300">{`'./components'`}</span></div>
          <div><span className="text-gray-600 mr-3">2</span></div>
          <div><span className="text-gray-600 mr-3">3</span><span className="text-purple-300">export default</span> <span className="text-yellow-200">function</span> <span className="text-blue-300">App</span><span className="text-white">() {'{'}</span></div>
          <div><span className="text-gray-600 mr-3">4</span><span className="text-white">  </span><span className="text-purple-300">return</span> <span className="text-gray-400">{'<'}</span><span className="text-blue-300">Dashboard</span> <span className="text-cyan-300">userId</span><span className="text-white">=</span><span className="text-green-300">{`"usr_01"`}</span> <span className="text-gray-400">{'/>'}</span></div>
          <div><span className="text-gray-600 mr-3">5</span><span className="text-white">{'}'}</span></div>
          <div className="flex items-center"><span className="text-gray-600 mr-3">6</span><span className="w-[2px] h-3.5 bg-emerald-400 animate-pulse" /></div>
        </div>
      </div>
    ),
    spec: (
      <div className="rounded-lg bg-[#161b22] border border-white/[0.06] overflow-hidden h-full">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2"><FileText className={`h-4 w-4 ${colors.text}`} /><span className="text-sm font-medium text-white">Product Requirements</span><span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-400">v2.1</span></div>
          {["User authentication flow", "Analytics dashboard", "API rate limiting", "Data export"].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px] text-gray-300 bg-white/[0.02] rounded-lg p-2.5">
              <CheckCircle2 className={`h-3.5 w-3.5 ${i < 2 ? colors.text : "text-gray-600"}`} />
              <span>{item}</span>
              {i < 2 && <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>Complete</span>}
            </div>
          ))}
        </div>
      </div>
    ),
    design: (
      <div className="rounded-lg bg-[#161b22] border border-white/[0.06] overflow-hidden h-full">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {[{ w: "full", h: "16", label: "Header" }, { w: "full", h: "24", label: "Hero" }, { w: "full", h: "12", label: "Sidebar" }, { w: "full", h: "20", label: "Content" }].map((block, i) => (
              <div key={i} className={`rounded-lg border ${colors.border} ${colors.bg} flex items-center justify-center`} style={{ height: `${block.h === "16" ? 64 : block.h === "24" ? 96 : block.h === "12" ? 48 : 80}px` }}>
                <span className={`text-[10px] ${colors.text}`}>{block.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    deploy: (
      <div className="rounded-lg bg-[#161b22] border border-white/[0.06] overflow-hidden h-full">
        <div className="p-4 space-y-3">
          {[{ step: "Build", status: "complete", time: "12s" }, { step: "Test", status: "complete", time: "8s" }, { step: "Deploy", status: "active", time: "..." }, { step: "Live", status: "pending", time: "" }].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${item.status === "complete" ? "bg-emerald-500 text-white" : item.status === "active" ? `${colors.bg} ${colors.text} ring-2 ring-amber-400/50` : "bg-white/5 text-gray-600"}`}>
                {item.status === "complete" ? "✓" : i + 1}
              </div>
              <div className="flex-1"><span className={item.status === "pending" ? "text-gray-600" : "text-white text-sm"}>{item.step}</span></div>
              <span className="text-[11px] text-gray-500">{item.time}</span>
              {item.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
    ),
    agents: (
      <div className="rounded-lg bg-[#161b22] border border-white/[0.06] overflow-hidden h-full">
        <div className="p-4 space-y-2.5">
          {([
            { agent: "elara" as const, task: "Orchestrating build pipeline", active: true },
            { agent: "themba" as const, task: "Constructing React components", active: true },
            { agent: "nia" as const, task: "Analyzing performance metrics", active: true },
            { agent: "zuri" as const, task: "Deploying to production", active: false },
          ]).map(({ agent, task, active }) => (
            <div key={agent} className="flex items-center gap-2.5 bg-white/[0.02] rounded-lg p-2.5">
              <AfricanAgentAvatar agent={agent} size="sm" showGlow={false} showAura={false} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-white capitalize">{agent}</div>
                <div className="text-[10px] text-gray-500 truncate">{task}</div>
              </div>
              <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
            </div>
          ))}
        </div>
      </div>
    ),
  }
  return <>{visuals[tabId]}</>
}

function TabbedFeatures() {
  const [activeTab, setActiveTab] = useState("code")
  const active = featureTabs.find((t) => t.id === activeTab)!
  const colors = colorMap[active.color]

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex items-center justify-center gap-1 mb-10 flex-wrap">
        {featureTabs.map((tab) => {
          const isActive = tab.id === activeTab
          const c = colorMap[tab.color]
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${isActive ? `${c.tabActive} ${c.bg} ${c.border}` : `${c.tab} border-transparent hover:border-white/10 hover:bg-white/[0.03]`}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left - Info */}
        <div className="space-y-6">
          <div>
            <h3 className="text-3xl font-bold text-white mb-2">{active.title}</h3>
            <p className="text-gray-400 text-lg">{active.subtitle}</p>
          </div>
          <div className="space-y-3">
            {active.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <CheckCircle2 className={`h-3.5 w-3.5 ${colors.text}`} />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">{feat}</span>
              </div>
            ))}
          </div>
          <Button asChild className={`mt-4 border ${colors.border} ${colors.text} bg-transparent hover:${colors.bg}`}>
            <Link href={`/features/${active.id === "code" ? "code-chamber" : active.id === "spec" ? "spec-chamber" : active.id === "design" ? "design-studio" : active.id === "deploy" ? "cloud-deploy" : "agents"}`}>
              Explore {active.title} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Right - Visual */}
        <div className="relative">
          <div className={`absolute -inset-4 ${colors.bg} rounded-2xl blur-2xl opacity-30`} />
          <div className="relative h-[340px]">
            <FeatureTabVisual tabId={active.id} color={active.color} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Workflow journey (Linear-style numbered steps) ───────────
const workflowSteps = [
  { num: "01", title: "Describe", desc: "Tell Elara what you want to build in natural language", icon: Sparkles, color: "emerald" },
  { num: "02", title: "Specify", desc: "AI generates specs, data models, and architecture plans", icon: FileText, color: "blue" },
  { num: "03", title: "Build", desc: "Agents write production code across your full stack", icon: Code2, color: "purple" },
  { num: "04", title: "Review", desc: "Constitutional AI validates safety, ethics, and quality", icon: Shield, color: "amber" },
  { num: "05", title: "Deploy", desc: "One-click deployment with preview environments", icon: Rocket, color: "pink" },
]

// ─── Agent activity feed ──────────────────────────────────────
const activityFeed = [
  { agent: "elara" as const, action: "Created project scaffolding with Next.js 15", time: "just now", room: "Code Chamber" },
  { agent: "nia" as const, action: "Analyzed API response times — 23ms avg", time: "2m ago", room: "AI Studio" },
  { agent: "themba" as const, action: "Built 4 dashboard components", time: "5m ago", room: "Code Chamber" },
  { agent: "zuri" as const, action: "Deployed preview to buildspaces.azora.dev", time: "8m ago", room: "Command Desk" },
  { agent: "imani" as const, action: "Generated design system with 12 tokens", time: "12m ago", room: "Design Studio" },
  { agent: "kwame" as const, action: "Architected microservices topology", time: "15m ago", room: "Spec Chamber" },
]

// ═══════════════════════════════════════════════════════════════
// ███  HOME PAGE  ███████████████████████████████████████████████
// ═══════════════════════════════════════════════════════════════
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* ═══ HERO ═══════════════════════════════════════════ */}
        <section className="relative pt-20 pb-8 lg:pt-28 lg:pb-16 overflow-hidden">
          <AetherBackground intensity="high" showParticles />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm px-4 py-2 text-sm">
                <span className="flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-2 w-2 bg-emerald-500" /></span>
                <span className="text-gray-300">Launching Soon</span>
                <span className="text-white/20">|</span>
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Powered by Constitutional AI</span>
              </div>
            </div>

            <div className="mx-auto max-w-5xl text-center mb-12 lg:mb-16">
              <MorphingHeadline />

              <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                The AI-native cloud IDE where a team of specialized agents builds alongside you.
                From idea to production in minutes — with built-in ethics, collaboration, and deployment.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 text-base rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">
                  <Link href="/auth/signup">
                    Start Building Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/10 hover:bg-white/5 bg-white/[0.02] backdrop-blur-sm h-12 px-8 text-base rounded-xl">
                  <Link href="/demo-code-chamber">
                    <Play className="mr-2 h-5 w-5" /> Live Demo
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>Ubuntu AI Ethics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-amber-400" />
                  <span>8 Specialized Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <span>8 Integrated Rooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-400" />
                  <span>Cloud-Native</span>
                </div>
              </div>
            </div>

            {/* Hero IDE Demo */}
            <div className="mx-auto max-w-7xl">
              <HeroIDEDemo />
            </div>
          </div>
        </section>

        {/* ═══ METRICS (Honest, launch-ready) ════════════════ */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]">
          <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedCounter target={8} label="Specialized AI Agents" />
            <AnimatedCounter target={8} label="Integrated Rooms" />
            <AnimatedCounter target={100} suffix="%" label="Open Source Core" />
            <AnimatedCounter target={1} suffix="st" label="AI IDE with Ubuntu Ethics" />
          </div>
        </section>

        {/* ═══ TABBED FEATURES (GitHub-style) ════════════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything you need to
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  build what&apos;s next
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                A complete development platform — from spec to code to deployment. Each room is purpose-built for a stage of your workflow.
              </p>
            </div>

            <TabbedFeatures />
          </div>
        </section>

        {/* ═══ WORKFLOW JOURNEY (Linear-style numbered) ══════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-emerald-500/[0.03] to-transparent">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                From idea to{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  production
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Just describe what you want to build. Elara and the team handle the rest.
              </p>
            </div>

            <div className="space-y-0 relative">
              {/* Connecting line */}
              <div className="absolute left-[39px] top-8 bottom-8 w-px bg-gradient-to-b from-emerald-500/40 via-purple-500/40 to-pink-500/40 hidden sm:block" />

              {workflowSteps.map((step, i) => {
                const c = colorMap[step.color] || colorMap.emerald
                return (
                  <div key={step.num} className="relative flex items-start gap-6 py-6 group">
                    {/* Number circle */}
                    <div className={`relative z-10 w-20 h-20 rounded-2xl ${c.bg} border ${c.border} flex flex-col items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <span className={`text-lg font-bold ${c.text}`}>{step.num}</span>
                    </div>
                    {/* Content */}
                    <div className="pt-2">
                      <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        {step.title}
                        <step.icon className={`h-5 w-5 ${c.text}`} />
                      </h3>
                      <p className="text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══ THE 8 ROOMS ═══════════════════════════════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">The 8 Rooms</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Eight interconnected environments with live agent activity.
              </p>
            </div>
            <LiveRoomGrid />
          </div>
        </section>

        {/* ═══ AGENT ACTIVITY FEED ═══════════════════════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left — Agent Showcase */}
              <div>
                <h2 className="text-4xl font-bold mb-4">Meet Your AI Team</h2>
                <p className="text-gray-400 mb-8 max-w-lg">
                  African-inspired AI agents, each with unique expertise. Governed by Constitutional AI with Ubuntu ethics for safe, transparent assistance.
                </p>
                <CopilotAgentShowcase />
                <div className="mt-8">
                  <Button asChild variant="outline" className="border-white/10 hover:bg-white/5 bg-transparent">
                    <Link href="/features/agents">
                      Learn more about agents <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right — Live Activity Feed */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-2 w-2 bg-emerald-500" /></span>
                  <h3 className="text-lg font-semibold text-white">Live Agent Activity</h3>
                </div>
                <div className="space-y-3">
                  {activityFeed.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all group"
                    >
                      <AfricanAgentAvatar agent={item.agent} size="sm" showGlow={false} showAura={false} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white capitalize">{item.agent}</span>
                          <span className="text-[10px] text-gray-600">in</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-gray-400">{item.room}</span>
                        </div>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{item.action}</p>
                      </div>
                      <span className="text-[11px] text-gray-600 flex-shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══════════════════════════════════════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-2xl overflow-hidden">
              {/* Background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20" />
              <div className="absolute inset-0 bg-[#0d1117]/60 backdrop-blur-sm" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />

              <div className="relative border border-emerald-500/20 rounded-2xl p-12 sm:p-16 text-center">
                <CitadelLogo size="lg" className="mx-auto mb-6" />
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">Ready to build the future?</h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
                  Join the next generation of developers building with AI agents, Constitutional AI governance, and the most advanced cloud IDE.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 h-12 px-8 text-base rounded-xl shadow-lg shadow-emerald-500/20">
                    <Link href="/auth/signup">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white/10 hover:bg-white/5 bg-transparent h-12 px-8 text-base rounded-xl">
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
