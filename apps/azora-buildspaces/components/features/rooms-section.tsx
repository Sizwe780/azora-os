import { Code2, FileText, Palette, Brain, Terminal, Wrench, Users } from "lucide-react"

const rooms = [
  {
    icon: Code2,
    name: "Code Chamber",
    tagline: "Coding",
    description:
      "Full-stack cloud IDE with real-time collaboration and AI pair programming. Built on Monaco, xterm.js, and Yjs.",
    color: "emerald",
  },
  {
    icon: FileText,
    name: "Spec Chamber",
    tagline: "Requirements",
    description:
      "Define requirements, generate tests, and validate logic before coding. Spec-driven development that works.",
    color: "blue",
  },
  {
    icon: Palette,
    name: "Design Studio",
    tagline: "UI/UX",
    description: "Import designs, auto-generate components, and validate accessibility. Figma integration included.",
    color: "purple",
  },
  {
    icon: Brain,
    name: "AI Studio",
    tagline: "Intelligence",
    description: "Orchestrate agents (Sankofa, Themba, Jabari) and manage context. Your AI nervous system.",
    color: "pink",
  },
  {
    icon: Terminal,
    name: "Command Desk",
    tagline: "Control",
    description: "Slash-command interface for agent control and system management. Power at your fingertips.",
    color: "amber",
  },
  {
    icon: Wrench,
    name: "Maker Lab",
    tagline: "Building",
    description: "Full-stack app scaffolding, database design, and deployment. From schema to production.",
    color: "rose",
  },
  {
    icon: Users,
    name: "Collaboration Pod",
    tagline: "Teamwork",
    description: "Pair programming, video conferencing, and code reviews. Build together, ship faster.",
    color: "cyan",
  },
]

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
  pink: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
}

export function RoomsSection() {
  return (
    <section id="rooms" className="border-t border-white/5 bg-gradient-to-b from-[#0d1117] to-[#161b22] px-4 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-sm text-purple-400">
            Architecture
          </span>
          <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">The 8 Rooms</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Purpose-built environments for every stage of your development workflow. Each room is powered by specialized
            agents and Constitutional AI guardrails.
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div
              key={room.name}
              className={`group relative overflow-hidden rounded-2xl border ${colorMap[room.color].border} ${colorMap[room.color].bg} p-6 transition-all hover:scale-[1.02]`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-lg p-2 ${colorMap[room.color].bg}`}>
                  <room.icon className={`h-6 w-6 ${colorMap[room.color].text}`} />
                </div>
                <span className={`text-xs font-medium uppercase tracking-wider ${colorMap[room.color].text}`}>
                  {room.tagline}
                </span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">{room.name}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{room.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
