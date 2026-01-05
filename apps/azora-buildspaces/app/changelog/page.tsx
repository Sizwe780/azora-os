import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Rocket, Zap, Shield, Bug, Gift } from "lucide-react"
import Link from "next/link"

export default function ChangeLogPage() {
  const releases = [
    {
      version: "v0.1.0-alpha",
      date: "December 31, 2025",
      title: "The Genesis Release",
      description: "Initial launch of the Azora BuildSpaces platform with core agent orchestration and constitutional verification.",
      changes: [
        { type: "feature", text: "Integrated Elara Orchestrator for multi-agent task management.", icon: Rocket },
        { type: "feature", text: "Launched Constitutional AI verification pipeline.", icon: Shield },
        { type: "feature", text: "Unified Workspace UI with real-time task synchronization.", icon: Zap },
        { type: "improvement", text: "Optimized AI routing for lower latency and cost.", icon: Zap },
        { type: "fix", text: "Resolved synchronization issues in collaborative rooms.", icon: Bug }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16">
            <h1 className="text-5xl font-bold mb-4">Changelog</h1>
            <p className="text-xl text-gray-400">
              Stay up to date with the latest features, improvements, and 
              fixes in the Azora ecosystem.
            </p>
          </div>

          <div className="space-y-16">
            {releases.map((release) => (
              <div key={release.version} className="relative pl-8 border-l border-white/10">
                <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-emerald-400 font-mono font-bold">{release.version}</span>
                    <span className="text-gray-500 text-sm">{release.date}</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">{release.title}</h2>
                  <p className="text-gray-400 leading-relaxed">{release.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {release.changes.map((change, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className={`p-2 rounded-lg ${
                        change.type === 'feature' ? 'bg-emerald-400/10 text-emerald-400' :
                        change.type === 'improvement' ? 'bg-blue-400/10 text-blue-400' :
                        'bg-red-400/10 text-red-400'
                      }`}>
                        <change.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1 block">{change.type}</span>
                        <p className="text-gray-300">{change.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 p-12 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 text-center">
            <Gift className="h-12 w-12 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Want to see a feature?</h2>
            <p className="text-gray-400 mb-8">We build in public and love hearing from our community.</p>
            <Button asChild>
              <a href="https://github.com/Azora-OS/azora/issues" target="_blank" rel="noopener noreferrer">Open an Issue on GitHub</a>
            </Button>
          </div>

          <div className="mt-12 text-center">
            <Link href="/" className="text-emerald-400 hover:underline">Back to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Button({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) {
  return (
    <button className="px-8 py-3 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-500 transition-colors">
      {children}
    </button>
  )
}
