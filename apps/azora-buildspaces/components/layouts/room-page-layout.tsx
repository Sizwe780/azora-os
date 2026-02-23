'use client'

import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface RoomFeature {
  icon: LucideIcon
  title: string
  description: string
}

interface RoomPageLayoutProps {
  roomName: string
  roomTagline: string
  roomDescription: string
  roomIcon: LucideIcon
  accentColor: "emerald" | "blue" | "purple" | "pink" | "amber" | "rose" | "cyan" | "indigo"
  features: RoomFeature[]
  capabilities: string[]
  demoHref?: string
  workspaceHref?: string
  ctaTitle: string
  ctaDescription: string
  children?: React.ReactNode
  visual?: React.ReactNode
}

const accents = {
  emerald: { badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", icon: "text-emerald-400", bg: "bg-emerald-500/10", glow: "from-emerald-500/10 to-cyan-500/10", border: "border-emerald-500/20", btn: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20", check: "text-emerald-400" },
  blue:    { badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",       icon: "text-blue-400",    bg: "bg-blue-500/10",    glow: "from-blue-500/10 to-cyan-500/10",    border: "border-blue-500/20",    btn: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20",    check: "text-blue-400" },
  purple:  { badge: "bg-purple-500/10 border-purple-500/20 text-purple-400", icon: "text-purple-400",  bg: "bg-purple-500/10",  glow: "from-purple-500/10 to-pink-500/10",  border: "border-purple-500/20",  btn: "bg-purple-500 hover:bg-purple-600 shadow-purple-500/20",  check: "text-purple-400" },
  pink:    { badge: "bg-pink-500/10 border-pink-500/20 text-pink-400",       icon: "text-pink-400",    bg: "bg-pink-500/10",    glow: "from-pink-500/10 to-rose-500/10",    border: "border-pink-500/20",    btn: "bg-pink-500 hover:bg-pink-600 shadow-pink-500/20",    check: "text-pink-400" },
  amber:   { badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",    icon: "text-amber-400",   bg: "bg-amber-500/10",   glow: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/20",   btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",   check: "text-amber-400" },
  rose:    { badge: "bg-rose-500/10 border-rose-500/20 text-rose-400",       icon: "text-rose-400",    bg: "bg-rose-500/10",    glow: "from-rose-500/10 to-pink-500/10",    border: "border-rose-500/20",    btn: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20",    check: "text-rose-400" },
  cyan:    { badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",       icon: "text-cyan-400",    bg: "bg-cyan-500/10",    glow: "from-cyan-500/10 to-teal-500/10",    border: "border-cyan-500/20",    btn: "bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/20",    check: "text-cyan-400" },
  indigo:  { badge: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",  icon: "text-indigo-400",  bg: "bg-indigo-500/10",  glow: "from-indigo-500/10 to-blue-500/10",  border: "border-indigo-500/20",  btn: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20",  check: "text-indigo-400" },
}

export function RoomPageLayout({
  roomName,
  roomTagline,
  roomDescription,
  roomIcon: RoomIcon,
  accentColor,
  features,
  capabilities,
  demoHref,
  workspaceHref = "/workspace",
  ctaTitle,
  ctaDescription,
  children,
  visual,
}: RoomPageLayoutProps) {
  const a = accents[accentColor]

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b ${a.glow} to-transparent opacity-50`} />
          <div className="relative mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${a.badge} border text-xs font-bold uppercase tracking-wider mb-6`}>
                  <RoomIcon className="h-3.5 w-3.5" />
                  {roomName}
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{roomTagline}</h1>
                <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-xl">{roomDescription}</p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className={`${a.btn} text-white h-12 px-8 text-base rounded-xl shadow-lg`} asChild>
                    <Link href={workspaceHref}>
                      <Play className="mr-2 h-4 w-4" /> Open {roomName}
                    </Link>
                  </Button>
                  {demoHref && (
                    <Button variant="outline" size="lg" className="border-white/10 hover:bg-white/5 bg-white/[0.02] h-12 px-8 text-base rounded-xl" asChild>
                      <Link href={demoHref}>Try Demo</Link>
                    </Button>
                  )}
                </div>
              </div>
              {visual && <div className="flex-1 w-full max-w-xl">{visual}</div>}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Core Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => (
                <div key={i} className="group p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300">
                  <div className={`p-2.5 rounded-lg ${a.bg} ${a.icon} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities checklist */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">What You Can Build</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilities.map((cap, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className={`p-1 rounded-full ${a.bg}`}>
                    <CheckCircle2 className={`h-4 w-4 ${a.check}`} />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Custom content slot */}
        {children}

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${a.glow}`} />
              <div className="absolute inset-0 bg-[#0d1117]/70 backdrop-blur-sm" />
              <div className={`relative border ${a.border} rounded-2xl p-12 text-center`}>
                <h2 className="text-3xl font-bold mb-4">{ctaTitle}</h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">{ctaDescription}</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button size="lg" className={`${a.btn} text-white h-12 px-8 rounded-xl shadow-lg`} asChild>
                    <Link href={workspaceHref}>
                      <ArrowRight className="mr-2 h-4 w-4" /> Enter {roomName}
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-white/10 hover:bg-white/5 bg-transparent h-12 px-8 rounded-xl" asChild>
                    <Link href="/features">View All Features →</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
