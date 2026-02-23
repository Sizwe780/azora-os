import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { Code2, FileText, Palette, Brain, Terminal, Wrench, Users, Sparkles, Shield, Zap, ArrowRight, Bot } from "lucide-react"
import Link from "next/link"

const features = [
  { title: "Code Chamber", description: "A full VS Code-class cloud IDE with Monaco editor, integrated terminal, Git, and Elara AI pair programming.", icon: Code2, color: "emerald", href: "/features/code-chamber" },
  { title: "Spec Chamber", description: "Transform ideas into validated technical specifications with AI-powered test generation and coverage tracking.", icon: FileText, color: "blue", href: "/features/spec-chamber" },
  { title: "Design Studio", description: "Bridge design and code. Import from Figma, build component libraries, and ship design systems.", icon: Palette, color: "purple", href: "/features/design-studio" },
  { title: "AI Studio", description: "The nerve center for agent orchestration. Route tasks, review code, and coordinate your entire AI team.", icon: Brain, color: "pink", href: "/features/ai-studio" },
  { title: "Command Desk", description: "A CLI-first command center for managing infrastructure, agents, and deployments with a single keystroke.", icon: Terminal, color: "amber", href: "/features/command-desk" },
  { title: "Maker Lab", description: "Rapidly scaffold full-stack applications. From database schemas to API endpoints in minutes.", icon: Wrench, color: "rose", href: "/features/maker-lab" },
  { title: "Collaboration Pod", description: "Real-time multi-cursor collaboration, shared whiteboards, video calls, and team chat — all in one.", icon: Users, color: "cyan", href: "/features/collaboration-pod" },
  { title: "Knowledge Ocean", description: "AI-powered semantic search across your entire codebase. Find anything instantly with vector embeddings.", icon: Sparkles, color: "indigo", href: "/features/knowledge-ocean" },
]

const colorClasses: Record<string, { icon: string; border: string; bg: string }> = {
  emerald: { icon: "text-emerald-400", border: "group-hover:border-emerald-500/30", bg: "bg-emerald-500/10" },
  blue:    { icon: "text-blue-400",    border: "group-hover:border-blue-500/30",    bg: "bg-blue-500/10" },
  purple:  { icon: "text-purple-400",  border: "group-hover:border-purple-500/30",  bg: "bg-purple-500/10" },
  pink:    { icon: "text-pink-400",    border: "group-hover:border-pink-500/30",    bg: "bg-pink-500/10" },
  amber:   { icon: "text-amber-400",   border: "group-hover:border-amber-500/30",   bg: "bg-amber-500/10" },
  rose:    { icon: "text-rose-400",    border: "group-hover:border-rose-500/30",    bg: "bg-rose-500/10" },
  cyan:    { icon: "text-cyan-400",    border: "group-hover:border-cyan-500/30",    bg: "bg-cyan-500/10" },
  indigo:  { icon: "text-indigo-400",  border: "group-hover:border-indigo-500/30",  bg: "bg-indigo-500/10" },
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <AetherBackground intensity="low" showParticles />
          <div className="relative mx-auto max-w-7xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.08] px-4 py-2 text-sm mb-8">
              <Bot className="h-4 w-4 text-emerald-400" />
              <span className="text-gray-300">8 Rooms · 8 Agents · 1 Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Platform Capabilities</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A unified ecosystem of specialized rooms, each purpose-built for a stage of the product lifecycle — with AI agents woven throughout.
            </p>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => {
              const c = colorClasses[feature.color]
              return (
                <Link key={feature.title} href={feature.href} className={`group relative p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06] ${c.border} hover:bg-white/[0.04] transition-all duration-300 flex flex-col`}>
                  <div className={`p-3 rounded-xl ${c.bg} ${c.icon} mb-5 w-fit group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed flex-grow">{feature.description}</p>
                  <div className="mt-5 flex items-center gap-1.5 text-sm text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-cyan-500/[0.08]" />
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-12 border border-white/[0.06] rounded-2xl">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-6">
                    <Shield className="h-3 w-3" /> Foundation
                  </div>
                  <h2 className="text-4xl font-bold mb-6">Powered by Constitutional AI</h2>
                  <p className="text-gray-400 leading-relaxed mb-8">
                    Every feature in BuildSpaces is built on a foundation of safety and ethics.
                    Our Constitutional AI layer ensures agents always act in accordance
                    with your principles, security policies, and the Ubuntu philosophy.
                  </p>
                  <div className="space-y-4">
                    {[
                      { icon: Shield, text: "Real-time action verification & ethical auditing" },
                      { icon: Zap, text: "Automated compliance with your governance rules" },
                      { icon: Sparkles, text: "Ubuntu philosophy: collective benefit over individual gain" },
                    ].map(({ icon: Icon, text }, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10"><Icon className="h-4 w-4 text-emerald-400" /></div>
                        <span className="text-gray-300">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.06] bg-[#0d1117] flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_70%)]" />
                  <div className="text-center relative z-10">
                    <Shield className="h-16 w-16 text-emerald-400/30 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-500 font-mono text-sm">Constitutional Verification Active</p>
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-400/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All actions validated
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pb-16 text-center">
          <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">← Back to home</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
