import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Building2, Shield, Users, Lock, BarChart3, Headphones, Globe, Server } from "lucide-react"
import Link from "next/link"

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Building2 className="h-3.5 w-3.5" />
              Enterprise
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Built for
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> Organizations</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Scale your development with Constitutional AI, enterprise security, compliance,
              and dedicated support for your entire organization.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all">
                Contact Sales
              </Link>
              <Link href="/pricing" className="inline-flex items-center px-8 py-3.5 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] rounded-xl transition-all">
                View Pricing →
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Lock, title: "SSO & SAML", description: "Single sign-on with SAML 2.0, OIDC, and Active Directory integration." },
                { icon: Shield, title: "Compliance", description: "SOC 2 Type II, GDPR, HIPAA compliance with full audit trails." },
                { icon: Server, title: "Self-Hosted", description: "Deploy on your own infrastructure — AWS, Azure, GCP, or on-premise." },
                { icon: Headphones, title: "Dedicated Support", description: "24/7 dedicated support team with guaranteed SLA response times." },
                { icon: Users, title: "Team Management", description: "Role-based access control, team workspaces, and admin dashboards." },
                { icon: BarChart3, title: "Analytics", description: "Organization-wide developer productivity metrics and insights." },
                { icon: Globe, title: "Custom LLMs", description: "Bring your own models or use our curated selection with cost controls." },
                { icon: Building2, title: "Custom Training", description: "Train agents on your codebase, internal docs, and coding standards." },
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 w-fit mb-4">
                    <feature.icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
              <div className="absolute inset-0 bg-[#0d1117]/70 backdrop-blur-sm" />
              <div className="relative border border-amber-500/20 rounded-2xl p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Let&apos;s Talk</h2>
                <p className="text-gray-400 mb-8">Schedule a demo and see how BuildSpaces can transform your team&apos;s development workflow.</p>
                <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all">
                  Schedule a Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
