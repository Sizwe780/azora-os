'use client'

import { RoomPageLayout } from "@/components/layouts/room-page-layout"
import { Brain, MessageSquare, Wand2, Shield, Zap, BookOpen } from "lucide-react"

export default function AIStudioPage() {
  return (
    <RoomPageLayout
      roomName="AI Studio"
      roomTagline="Your AI Agent Command Center"
      roomDescription="Interact with your team of AI agents — code review, testing, security, performance, and documentation. Powered by Ubuntu Ethics and Constitutional AI."
      roomIcon={Brain}
      accentColor="purple"
      demoHref="/demo-ai-studio"
      ctaTitle="Meet Your AI Team"
      ctaDescription="Start collaborating with 8 specialized AI agents, each with unique expertise and African-inspired identity."
      features={[
        { icon: Brain, title: "Multi-Agent Intelligence", description: "8 specialized agents — Elara, Sankofa, Themba, Jabari, Nia, Imani, Zuri, Kwame — each with distinct expertise" },
        { icon: MessageSquare, title: "Natural Conversations", description: "Chat naturally with agents or let auto-routing find the best agent for your request" },
        { icon: Wand2, title: "Code Generation", description: "Generate, refactor, and optimize code with AI that understands your full codebase context" },
        { icon: Shield, title: "Security Analysis", description: "Jabari scans for vulnerabilities, OWASP compliance, and security best practices" },
        { icon: Zap, title: "Performance Tuning", description: "Nia identifies bottlenecks, suggests optimizations, and benchmarks improvements" },
        { icon: BookOpen, title: "Auto Documentation", description: "Imani generates and maintains documentation that stays in sync with your code" },
      ]}
      capabilities={[
        "Multi-agent code review",
        "Automated test generation",
        "Security vulnerability scanning",
        "Performance profiling & optimization",
        "Documentation generation",
        "Dependency analysis",
        "Architecture recommendations",
        "Code migration assistance",
        "Bug detection and auto-fix",
        "Knowledge graph building",
      ]}
      visual={
        <div className="rounded-2xl bg-[#161b22] border border-white/[0.06] overflow-hidden shadow-2xl shadow-purple-500/5">
          <div className="bg-[#0d1117] px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" /></div>
            <span className="text-xs text-gray-500 font-mono ml-3">ai-studio — agents</span>
          </div>
          <div className="p-4 space-y-2.5">
            {[
              { name: "Elara", role: "Lead Engineer", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { name: "Sankofa", role: "Code Architect", color: "text-blue-400", bg: "bg-blue-500/10" },
              { name: "Jabari", role: "Security Expert", color: "text-red-400", bg: "bg-red-500/10" },
              { name: "Nia", role: "Performance", color: "text-yellow-400", bg: "bg-yellow-500/10" },
            ].map((agent) => (
              <div key={agent.name} className={`flex items-center gap-3 p-2.5 rounded-lg ${agent.bg} border border-white/[0.04]`}>
                <div className={`w-2 h-2 rounded-full ${agent.color.replace('text-', 'bg-')} animate-pulse`} />
                <div>
                  <span className={`text-xs font-semibold ${agent.color}`}>{agent.name}</span>
                  <span className="text-[10px] text-gray-500 ml-2">{agent.role}</span>
                </div>
                <span className="text-[10px] text-gray-600 ml-auto">online</span>
              </div>
            ))}
            <div className="mt-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <div className="text-[11px] text-gray-400">
                <span className="text-purple-400 font-semibold">Elara:</span> I&apos;ve reviewed the auth module — found 2 potential improvements. Want me to apply them?
              </div>
            </div>
          </div>
        </div>
      }
    />
  )
}
