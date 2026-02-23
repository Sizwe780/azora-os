import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Briefcase, Heart, Globe, Sparkles, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"

const openings = [
  { title: "Senior Frontend Engineer", team: "Platform", location: "Remote", type: "Full-time" },
  { title: "AI/ML Engineer", team: "Agents", location: "Remote", type: "Full-time" },
  { title: "DevOps Engineer", team: "Infrastructure", location: "Remote", type: "Full-time" },
  { title: "Technical Writer", team: "Developer Experience", location: "Remote", type: "Contract" },
  { title: "Community Manager", team: "Growth", location: "Remote", type: "Full-time" },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Briefcase className="h-3.5 w-3.5" />
              Careers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Build the Future
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent"> With Us</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Join a remote-first team building the world&apos;s first ethical AI development platform.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: "Remote-First", description: "Work from anywhere. We're a global team spanning multiple continents and time zones." },
              { icon: Heart, title: "Mission-Driven", description: "We're building technology that respects human dignity and promotes collective benefit." },
              { icon: Sparkles, title: "Open Source", description: "Everything we build is open. Contribute to a project that matters." },
            ].map((v, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all">
                <div className="p-3 rounded-xl bg-pink-500/10 w-fit mb-5">
                  <v.icon className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
            <div className="space-y-3">
              {openings.map((job, i) => (
                <Link key={i} href="/contact" className="block group">
                  <div className="flex items-center justify-between p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-pink-500/20 hover:bg-white/[0.04] transition-all duration-300">
                    <div>
                      <h3 className="font-semibold group-hover:text-pink-400 transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{job.team}</span>
                        <span className="text-gray-700">·</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        <span className="text-gray-700">·</span>
                        <span className="text-xs text-gray-500">{job.type}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-pink-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-center text-gray-500 text-sm mt-8">Don&apos;t see your role? Email us at <span className="text-pink-400">careers@azora.dev</span></p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
