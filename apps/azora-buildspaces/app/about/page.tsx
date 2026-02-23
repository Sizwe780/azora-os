import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Heart, Globe, Shield, Users, Sparkles, Code2 } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Heart className="h-3.5 w-3.5" />
              Our Story
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Building the Future of
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> Ethical Development</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Azora BuildSpaces is the world&apos;s first IDE built on Ubuntu Ethics — where AI agents
              collaborate with developers guided by constitutional principles of dignity, transparency, and collective benefit.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Globe, title: "Ubuntu Philosophy", description: "\"I am because we are.\" Our platform embodies the African philosophy that individual success is inseparable from collective wellbeing." },
                { icon: Shield, title: "Constitutional AI", description: "Every AI action is validated against ethical principles — no harmful code, no exploitative patterns, always transparent." },
                { icon: Users, title: "Community First", description: "100% open source. Built by the community, for the community. No vendor lock-in, no hidden agendas." },
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                  <div className="p-3 rounded-xl bg-emerald-500/10 w-fit mb-6">
                    <item.icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Agents */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-4">Meet the AI Family</h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">8 specialized AI agents, each with an African-inspired identity and unique expertise.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Elara", role: "Lead Engineer", color: "emerald" },
                { name: "Sankofa", role: "Code Architect", color: "blue" },
                { name: "Themba", role: "Testing Specialist", color: "purple" },
                { name: "Jabari", role: "Security Expert", color: "red" },
                { name: "Nia", role: "Performance", color: "yellow" },
                { name: "Imani", role: "Knowledge Manager", color: "cyan" },
                { name: "Zuri", role: "UX Designer", color: "pink" },
                { name: "Kwame", role: "DevOps Lead", color: "amber" },
              ].map((agent) => (
                <div key={agent.name} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] text-center transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-full bg-${agent.color}-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-lg">🤖</span>
                  </div>
                  <h3 className="font-semibold">{agent.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{agent.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="space-y-6">
              {[
                { title: "Transparency", description: "Every AI decision is explainable. Every action is logged. No black boxes." },
                { title: "Dignity", description: "Technology should uplift, not exploit. Every feature respects user agency and autonomy." },
                { title: "Collective Benefit", description: "Success is measured not just by productivity, but by positive impact on teams and communities." },
                { title: "Open Source", description: "Built in the open. Free to use, fork, and improve. Knowledge belongs to everyone." },
              ].map((value, i) => (
                <div key={i} className="flex gap-6 items-start p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="p-2 rounded-lg bg-emerald-500/10 mt-1">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-gray-400">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10" />
              <div className="absolute inset-0 bg-[#0d1117]/70 backdrop-blur-sm" />
              <div className="relative border border-emerald-500/20 rounded-2xl p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">Be part of the first development platform built on Ubuntu Ethics.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/workspace" className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
                    <Code2 className="h-4 w-4" /> Start Building
                  </Link>
                  <Link href="/features" className="inline-flex items-center px-8 py-3 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] rounded-xl transition-all">
                    Explore Features →
                  </Link>
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
