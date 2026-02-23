'use client'

import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Handshake, Globe, Code2, Building2, Send, Sparkles } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const partnerTypes = [
  { icon: Code2, title: "Technology Partners", description: "Integrate your tools, APIs, or services with the BuildSpaces platform." },
  { icon: Building2, title: "Enterprise Partners", description: "Bring BuildSpaces to your organization with co-branded solutions." },
  { icon: Globe, title: "Community Partners", description: "Help grow the open-source ecosystem through education, events, and advocacy." },
  { icon: Sparkles, title: "AI Partners", description: "Contribute models, agents, or AI capabilities to the Constitutional AI framework." },
]

export default function PartnersPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Handshake className="h-3.5 w-3.5" />
              Partners
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Partner
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> With Us</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Join a growing ecosystem of organizations committed to ethical AI development.
            </p>
          </div>
        </section>

        {/* Partner Types */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {partnerTypes.map((type, i) => (
              <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/20 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 w-fit mb-4">
                  <type.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold mb-2">{type.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Partner Form */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-center mb-8">Become a Partner</h2>
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="p-3 rounded-full bg-emerald-500/10 w-fit mx-auto mb-4">
                    <Send className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Application Received!</h3>
                  <p className="text-gray-400">We&apos;ll review your application and get back to you within 48 hours.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                      <input type="text" required className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 focus:border-cyan-500/40 focus:outline-none transition-colors" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Organization</label>
                      <input type="text" required className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 focus:border-cyan-500/40 focus:outline-none transition-colors" placeholder="Company name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <input type="email" required className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 focus:border-cyan-500/40 focus:outline-none transition-colors" placeholder="you@company.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Partnership Type</label>
                    <select className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white focus:border-cyan-500/40 focus:outline-none transition-colors">
                      <option value="technology">Technology Partner</option>
                      <option value="enterprise">Enterprise Partner</option>
                      <option value="community">Community Partner</option>
                      <option value="ai">AI Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Tell us about your interest</label>
                    <textarea rows={4} required className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 focus:border-cyan-500/40 focus:outline-none transition-colors resize-none" placeholder="How would you like to partner with Azora?" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" /> Submit Application
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
