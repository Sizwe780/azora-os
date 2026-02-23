'use client'

import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Mail, MessageSquare, MapPin, Send } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
          <div className="relative mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                  <Mail className="h-3.5 w-3.5" />
                  Contact
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                  Get in
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Touch</span>
                </h1>
                <p className="text-lg text-gray-400 mb-12 leading-relaxed">
                  Have questions about BuildSpaces? Want to discuss enterprise plans?
                  We&apos;d love to hear from you.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: Mail, label: "Email", value: "hello@azora.dev" },
                    { icon: MessageSquare, label: "Discord", value: "discord.gg/azora" },
                    { icon: MapPin, label: "Location", value: "Remote-first, Global" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-blue-500/10">
                        <item.icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-sm text-gray-300">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Form */}
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="p-3 rounded-full bg-emerald-500/10 mb-4">
                      <Send className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-gray-400">We&apos;ll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                      <input type="text" required className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 focus:border-blue-500/40 focus:outline-none transition-colors" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                      <input type="email" required className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 focus:border-blue-500/40 focus:outline-none transition-colors" placeholder="you@company.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
                      <select className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white focus:border-blue-500/40 focus:outline-none transition-colors">
                        <option value="general">General Inquiry</option>
                        <option value="enterprise">Enterprise Plans</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
                      <textarea rows={5} required className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 focus:border-blue-500/40 focus:outline-none transition-colors resize-none" placeholder="Tell us what you need..." />
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                      <Send className="h-4 w-4" /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
