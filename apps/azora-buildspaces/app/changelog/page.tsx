import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { GitCommit, Sparkles, Bug, Zap, Shield } from "lucide-react"

const releases = [
  {
    version: "v0.1.0-alpha",
    date: "2026-01-15",
    tag: "Latest",
    tagColor: "emerald",
    changes: [
      { type: "feature", text: "Initial alpha release of BuildSpaces platform" },
      { type: "feature", text: "8 rooms: Code Chamber, Design Studio, Spec Chamber, AI Studio, Command Desk, Maker Lab, Collaboration Pod, Knowledge Ocean" },
      { type: "feature", text: "8 AI agents with Constitutional AI validation" },
      { type: "feature", text: "Monaco-based code editor with full IDE features" },
      { type: "feature", text: "Real-time collaboration with Yjs CRDT" },
    ],
  },
  {
    version: "v0.0.9-dev",
    date: "2025-12-20",
    tag: "Pre-release",
    tagColor: "amber",
    changes: [
      { type: "feature", text: "Knowledge Ocean with vector search" },
      { type: "feature", text: "Agent routing system (LOCAL_LLM → RAP_SYSTEM → EXTERNAL_LLM)" },
      { type: "fix", text: "Fixed workspace persistence across sessions" },
      { type: "perf", text: "Optimized editor load time by 40%" },
    ],
  },
  {
    version: "v0.0.8-dev",
    date: "2025-12-01",
    tag: "Pre-release",
    tagColor: "amber",
    changes: [
      { type: "feature", text: "Command Desk CLI interface" },
      { type: "feature", text: "Spec Chamber spec-to-test generation" },
      { type: "fix", text: "Fixed agent context window management" },
      { type: "security", text: "Added Constitutional AI validation layer" },
    ],
  },
  {
    version: "v0.0.5-dev",
    date: "2025-11-01",
    tag: "Pre-release",
    tagColor: "amber",
    changes: [
      { type: "feature", text: "Initial Code Chamber with Monaco editor" },
      { type: "feature", text: "Elara AI pair programming assistant" },
      { type: "feature", text: "Basic workspace management" },
    ],
  },
]

const typeIcon: Record<string, typeof Sparkles> = {
  feature: Sparkles,
  fix: Bug,
  perf: Zap,
  security: Shield,
}

const typeColor: Record<string, string> = {
  feature: "text-emerald-400",
  fix: "text-blue-400",
  perf: "text-amber-400",
  security: "text-red-400",
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
              <GitCommit className="h-3.5 w-3.5" />
              Changelog
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              What&apos;s
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> New</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Track every update, feature, and fix as we build BuildSpaces.
            </p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-white/[0.06]" />

              <div className="space-y-12">
                {releases.map((release, i) => (
                  <div key={i} className="relative pl-12">
                    {/* Timeline dot */}
                    <div className="absolute left-[11px] top-1 w-4 h-4 rounded-full bg-[#0d1117] border-2 border-emerald-500/40" />

                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-xl font-bold font-mono">{release.version}</h2>
                      <span className={`px-2 py-0.5 rounded-full bg-${release.tagColor}-500/10 text-${release.tagColor}-400 text-[10px] font-bold uppercase`}>{release.tag}</span>
                      <span className="text-xs text-gray-600">{release.date}</span>
                    </div>

                    <div className="space-y-2">
                      {release.changes.map((change, j) => {
                        const Icon = typeIcon[change.type] || Sparkles
                        return (
                          <div key={j} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${typeColor[change.type]}`} />
                            <span className="text-sm text-gray-300">{change.text}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
