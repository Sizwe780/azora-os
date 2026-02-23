import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Shield, Lock, Eye, Server, CheckCircle2, FileText } from "lucide-react"
import Link from "next/link"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Shield className="h-3.5 w-3.5" />
              Security
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Security
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"> First</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Built with security at every layer. From Constitutional AI validation to end-to-end encryption.
            </p>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Constitutional AI", description: "Every AI action is validated against ethical and security principles before execution." },
              { icon: Lock, title: "End-to-End Encryption", description: "All data encrypted in transit (TLS 1.3) and at rest (AES-256)." },
              { icon: Eye, title: "Audit Logging", description: "Complete audit trail of all actions, AI decisions, and data access." },
              { icon: Server, title: "SOC 2 Type II", description: "Enterprise-grade compliance with SOC 2 Type II certification." },
              { icon: CheckCircle2, title: "Vulnerability Scanning", description: "Continuous automated security scanning with Jabari, our security agent." },
              { icon: FileText, title: "Responsible Disclosure", description: "Structured vulnerability disclosure program. Report issues safely." },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-red-500/10 w-fit mb-4">
                  <item.icon className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-center mb-8">Report a Vulnerability</h2>
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-gray-400 mb-6">
                If you&apos;ve found a security vulnerability, please report it responsibly.
                We take all reports seriously and will respond within 24 hours.
              </p>
              <Link href="mailto:security@azora.dev" className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 transition-all">
                <Shield className="h-4 w-4" /> security@azora.dev
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
