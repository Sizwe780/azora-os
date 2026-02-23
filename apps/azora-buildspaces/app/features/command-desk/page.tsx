'use client'

import { RoomPageLayout } from "@/components/layouts/room-page-layout"
import { Terminal, Command, Zap, Shield, Search, Settings } from "lucide-react"

export default function CommandDeskPage() {
  return (
    <RoomPageLayout
      roomName="Command Desk"
      roomTagline="CLI-First Command Center"
      roomDescription="A powerful, CLI-first interface for managing your entire infrastructure. Execute complex workflows, manage agents, and monitor deployments with a single keystroke."
      roomIcon={Terminal}
      accentColor="amber"
      demoHref="/demo-command-desk"
      ctaTitle="Open the Terminal"
      ctaDescription="Take command of your entire stack — Git, deployments, agents, and infrastructure from one interface."
      features={[
        { icon: Command, title: "Unified Interface", description: "One command line for Git, AWS, Slack, and your custom AI agents — no context switching" },
        { icon: Zap, title: "Macro Engine", description: "Record and replay complex command sequences across multiple environments automatically" },
        { icon: Shield, title: "Secure Execution", description: "Every command audited by Constitutional AI for compliance with security policies" },
        { icon: Search, title: "Smart Search", description: "Fuzzy search across commands, history, and documentation with instant previews" },
        { icon: Terminal, title: "Agent Invocation", description: "Invoke any AI agent directly from the terminal with natural language" },
        { icon: Settings, title: "Custom Workflows", description: "Define and share custom workflows, aliases, and automation pipelines" },
      ]}
      capabilities={[
        "Infrastructure management",
        "Agent invocation and orchestration",
        "Deployment automation",
        "Security auditing",
        "Log analysis and monitoring",
        "Database management",
        "CI/CD pipeline control",
        "Environment provisioning",
        "Multi-cloud operations",
        "Team command sharing",
      ]}
      visual={
        <div className="rounded-2xl bg-[#161b22] border border-white/[0.06] overflow-hidden shadow-2xl shadow-amber-500/5">
          <div className="bg-[#0d1117] px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" /></div>
            <span className="text-xs text-gray-500 font-mono ml-3">azora-terminal — 80x24</span>
          </div>
          <div className="p-5 font-mono text-[12px] space-y-2">
            <div className="flex gap-2">
              <span className="text-amber-400">➜</span>
              <span className="text-blue-400">~</span>
              <span className="text-gray-300">azora status</span>
            </div>
            <div className="text-gray-500 space-y-0.5 pl-4">
              <div>[SYSTEM] All systems operational.</div>
              <div>[AGENTS] 8 agents active in 3 rooms.</div>
              <div>[BUILD] v0.1.0-alpha deployed 2h ago.</div>
            </div>
            <div className="flex gap-2 mt-2">
              <span className="text-amber-400">➜</span>
              <span className="text-blue-400">~</span>
              <span className="text-gray-300">azora agent invoke elara &apos;review auth&apos;</span>
            </div>
            <div className="text-emerald-400 pl-4">✓ Elara reviewing auth module...</div>
            <div className="flex gap-2 mt-1">
              <span className="text-amber-400">➜</span>
              <span className="text-blue-400">~</span>
              <span className="w-[2px] h-4 bg-amber-400 animate-pulse" />
            </div>
          </div>
        </div>
      }
    />
  )
}
