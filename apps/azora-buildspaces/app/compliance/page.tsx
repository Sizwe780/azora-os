import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Shield, CheckCircle2, FileText, Globe, Lock, Eye } from "lucide-react"
import Link from "next/link"

const frameworks = [
  { name: "SOC 2 Type II", status: "In Progress", statusColor: "amber", description: "Service Organization Control certification for security, availability, and confidentiality." },
  { name: "GDPR", status: "Compliant", statusColor: "emerald", description: "Full compliance with the EU General Data Protection Regulation." },
  { name: "HIPAA", status: "Planned", statusColor: "gray", description: "Health Insurance Portability and Accountability Act compliance for healthcare clients." },
  { name: "ISO 27001", status: "Planned", statusColor: "gray", description: "Information security management system certification." },
  { name: "CCPA", status: "Compliant", statusColor: "emerald", description: "California Consumer Privacy Act compliance for US data protection." },
  { name: "Constitutional AI", status: "Active", statusColor: "emerald", description: "Our own ethical AI governance framework ensuring every AI action meets dignity, transparency, and benefit standards." },
]

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Shield className="h-3.5 w-3.5" />
              Compliance
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Trust &
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Compliance</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              BuildSpaces is built with enterprise-grade compliance and security standards from the ground up.
            </p>
          </div>
        </section>

        {/* Compliance Frameworks */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold mb-8">Compliance Frameworks</h2>
            <div className="space-y-4">
              {frameworks.map((fw, i) => (
                <div key={i} className="flex items-start justify-between p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-500/10 mt-0.5">
                      <Shield className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{fw.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{fw.description}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full bg-${fw.statusColor}-500/10 text-${fw.statusColor}-400 text-xs font-semibold whitespace-nowrap`}>{fw.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Practices */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-center mb-12">Our Security Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Lock, title: "Data Encryption", description: "TLS 1.3 in transit, AES-256 at rest. Your code never leaves encrypted channels." },
                { icon: Eye, title: "Access Control", description: "Role-based access, MFA enforcement, and session management across all accounts." },
                { icon: FileText, title: "Audit Trail", description: "Complete logging of all actions, AI decisions, and data access events." },
              ].map((practice, i) => (
                <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 w-fit mb-4">
                    <practice.icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{practice.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{practice.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-gray-400 mb-6">Need detailed compliance documentation or a security questionnaire?</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
              <CheckCircle2 className="h-4 w-4" /> Request Compliance Docs
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
