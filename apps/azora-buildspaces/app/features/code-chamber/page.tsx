'use client'

import { RoomPageLayout } from "@/components/layouts/room-page-layout"
import { Code2, Terminal, GitBranch, Users, Wand2, Cloud } from "lucide-react"

export default function CodeChamberPage() {
  return (
    <RoomPageLayout
      roomName="Code Chamber"
      roomTagline="Professional Cloud IDE"
      roomDescription="A full VS Code-class IDE in the cloud — Monaco editor, integrated terminal, Git, and Elara AI pair programming. Build full-stack applications with real-time collaboration."
      roomIcon={Code2}
      accentColor="emerald"
      demoHref="/demo-code-chamber"
      ctaTitle="Ready to Start Coding?"
      ctaDescription="Access the full Code Chamber — no setup required, everything runs in the cloud with persistent storage."
      features={[
        { icon: Code2, title: "Monaco Editor", description: "Professional code editing with syntax highlighting, IntelliSense, and multi-cursor support" },
        { icon: Terminal, title: "Integrated Terminal", description: "Full shell access with PTY support, connected to your cloud workspace" },
        { icon: GitBranch, title: "Git Integration", description: "Version control, branching, and collaboration workflows built-in" },
        { icon: Users, title: "Real-time Collaboration", description: "Yjs-powered collaborative editing with awareness and conflict resolution" },
        { icon: Wand2, title: "AI Assistance", description: "Elara AI agent provides code suggestions, refactoring, and intelligent help" },
        { icon: Cloud, title: "Cloud Workspace", description: "Persistent file system with auto-save and cross-device synchronization" },
      ]}
      capabilities={[
        "TypeScript/JavaScript development",
        "React/Next.js applications",
        "Node.js backend services",
        "Database integrations",
        "API development and testing",
        "Real-time collaboration",
        "AI-powered code generation",
        "Terminal operations",
        "Git version control",
        "Package management",
      ]}
      visual={
        <div className="rounded-2xl bg-[#161b22] border border-white/[0.06] overflow-hidden shadow-2xl shadow-emerald-500/5">
          <div className="bg-[#0d1117] px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" /></div>
            <span className="text-xs text-gray-500 font-mono ml-3">dashboard.tsx — Code Chamber</span>
          </div>
          <div className="p-5 font-mono text-[12px] leading-relaxed space-y-1">
            <div><span className="text-gray-600 mr-3 select-none">1</span><span className="text-purple-300">import</span> <span className="text-cyan-300">{'{ Analytics }'}</span> <span className="text-purple-300">from</span> <span className="text-green-300">{`'@/lib/analytics'`}</span></div>
            <div><span className="text-gray-600 mr-3 select-none">2</span><span className="text-purple-300">import</span> <span className="text-cyan-300">{'{ Card }'}</span> <span className="text-purple-300">from</span> <span className="text-green-300">{`'@/components/ui'`}</span></div>
            <div><span className="text-gray-600 mr-3 select-none">3</span></div>
            <div><span className="text-gray-600 mr-3 select-none">4</span><span className="text-purple-300">export default</span> <span className="text-yellow-200">function</span> <span className="text-blue-300">Dashboard</span><span className="text-white">() {'{'}</span></div>
            <div><span className="text-gray-600 mr-3 select-none">5</span>  <span className="text-purple-300">const</span> <span className="text-cyan-300">data</span> = <span className="text-yellow-200">useAnalytics</span>()</div>
            <div><span className="text-gray-600 mr-3 select-none">6</span>  <span className="text-purple-300">return</span> <span className="text-gray-400">{'<'}</span><span className="text-blue-300">Card</span> <span className="text-cyan-300">metrics</span>=<span className="text-white">{'{data}'}</span> <span className="text-gray-400">{'/>'}</span></div>
            <div><span className="text-gray-600 mr-3 select-none">7</span><span className="text-white">{'}'}</span></div>
            <div><span className="text-gray-600 mr-3 select-none">8</span><span className="w-[2px] h-4 bg-emerald-400 inline-block animate-pulse" /></div>
          </div>
        </div>
      }
    />
  )
}
