import { Bot, Sparkles, Code2, Shield, Zap, Users } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Bot,
    title: "Experience AI with Elara",
    description: "Your XO Architect orchestrating specialized agents",
    href: "/features/agents",
    color: "emerald",
  },
  {
    icon: Sparkles,
    title: "The 8 Rooms",
    description: "Purpose-built environments for every workflow",
    href: "/features/rooms",
    color: "purple",
  },
  {
    icon: Code2,
    title: "Code Chamber",
    description: "Full-stack cloud IDE with real-time collaboration",
    href: "/features/code-chamber",
    color: "blue",
  },
  {
    icon: Shield,
    title: "Constitutional Guardrails",
    description: "AI-verified code with truth as law",
    href: "/features/security",
    color: "amber",
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description: "From idea to production in minutes",
    href: "/features/deployment",
    color: "rose",
  },
  {
    icon: Users,
    title: "Collaboration Pod",
    description: "Pair programming and real-time sync",
    href: "/features/collaboration",
    color: "cyan",
  },
]

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20",
  purple: "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20",
  blue: "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20",
  amber: "bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20",
  rose: "bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20",
}

export function FeatureCards() {
  return (
    <section className="border-t border-white/5 bg-[#0d1117] px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#161b22] p-6 transition-all hover:border-white/20 hover:bg-[#1c2128]"
            >
              <div className={`mb-4 inline-flex rounded-lg p-3 transition-colors ${colorMap[feature.color]}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mb-4 text-sm text-gray-400">{feature.description}</p>
              <span className="inline-flex items-center text-sm text-emerald-400 transition-colors group-hover:text-emerald-300">
                Learn more <span className="ml-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
