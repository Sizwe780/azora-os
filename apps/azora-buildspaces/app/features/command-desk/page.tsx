import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Terminal, Command, Zap, Shield, Search, Code, Settings, Play } from "lucide-react"
import Link from "next/link"

export default function CommandDeskPage() {
  const commands = [
    { cmd: "azora deploy --prod", desc: "Deploy current workspace to production" },
    { cmd: "azora audit --security", desc: "Run a full security audit on the codebase" },
    { cmd: "azora agent invoke elara 'fix bug in auth'", desc: "Invoke Elara to fix a specific issue" },
    { cmd: "azora room create 'New Feature'", desc: "Initialize a new development room" }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16 items-center mb-24">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                <Terminal className="h-3 w-3" />
                Command Center
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                The Command Desk
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                A powerful, CLI-first interface for managing your entire infrastructure. 
                Execute complex workflows, manage agents, and monitor deployments 
                with a single keystroke.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all">
                  Open Terminal
                </button>
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                  View Documentation
                </button>
              </div>
            </div>
            <div className="flex-1 w-full max-w-2xl">
              <div className="rounded-2xl bg-black border border-white/10 overflow-hidden shadow-2xl shadow-emerald-500/5">
                <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-xs text-gray-500 font-mono ml-4">azora-terminal — 80x24</div>
                </div>
                <div className="p-6 font-mono text-sm">
                  <div className="flex gap-2 mb-2">
                    <span className="text-emerald-400">➜</span>
                    <span className="text-blue-400">~</span>
                    <span>azora status</span>
                  </div>
                  <div className="text-gray-500 mb-4">
                    [SYSTEM] All systems operational.<br />
                    [AGENTS] 8 agents active in 3 rooms.<br />
                    [BUILD] v0.1.0-alpha deployed 2h ago.
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-emerald-400">➜</span>
                    <span className="text-blue-400">~</span>
                    <span className="animate-pulse">_</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <Command className="h-10 w-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-4">Unified Interface</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                One command line to rule them all. Manage Git, AWS, Slack, and your 
                custom AI agents from a single, unified interface.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <Zap className="h-10 w-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-4">Macro Engine</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Automate repetitive tasks by recording and replaying complex 
                command sequences across multiple environments.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <Shield className="h-10 w-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-4">Secure Execution</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every command is audited by the Constitutional AI to ensure 
                compliance with your organization's security policies.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Common Commands</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {commands.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 group hover:border-emerald-400/30 transition-all">
                  <div>
                    <code className="text-emerald-400 font-mono text-sm">{c.cmd}</code>
                    <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
                  </div>
                  <Play className="h-4 w-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 text-center">
            <Link href="/features" className="text-emerald-400 hover:underline">Back to Platform Overview</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
