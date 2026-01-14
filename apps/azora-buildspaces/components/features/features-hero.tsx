import Link from "next/link"
import { AetherBackground } from "@/components/ui/aether-background"

const subNavItems = [
  { name: "AI Agents", href: "/features/agents", active: false },
  { name: "Code Chamber", href: "/features/code-chamber", active: false },
  { name: "The 8 Rooms", href: "/features#rooms", active: false },
  { name: "BuildSpaces CLI", href: "/features/cli", active: false },
  { name: "For Business", href: "/features/business", active: false },
  { name: "Tutorials", href: "/features/tutorials", active: false },
  { name: "Plans & pricing", href: "/pricing", active: false },
]

export function FeaturesHero() {
  return (
    <section className="relative overflow-hidden bg-[#0d1117] px-4 pt-8 pb-24">
      <AetherBackground intensity="medium" />

      {/* Sub-navigation bar - GitHub style */}
      <div className="relative mx-auto mb-16 max-w-7xl border-b border-white/10">
        <div className="flex items-center gap-2 pb-4">
          <span className="font-semibold text-white">Features</span>
          <span className="text-gray-500">/</span>
          <nav className="flex flex-wrap items-center gap-1">
            {subNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${item.active ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="relative mx-auto max-w-5xl text-center">
        <h1 className="mb-8 text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          The tools you need to build{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            what you want
          </span>
        </h1>
      </div>
    </section>
  )
}
