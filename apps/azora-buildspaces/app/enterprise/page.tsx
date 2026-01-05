import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Building2, ShieldCheck, Zap, Users, BarChart3, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Azora for Enterprise
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Scale your AI operations with confidence. Azora provides the security, 
              governance, and performance required by the world's largest organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <ShieldCheck className="h-12 w-12 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Advanced Governance</h3>
              <p className="text-gray-400 leading-relaxed">
                Custom constitutional guardrails, granular RBAC, and full audit logs 
                ensure your AI agents operate within your corporate policies.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <Zap className="h-12 w-12 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Dedicated Compute</h3>
              <p className="text-gray-400 leading-relaxed">
                Isolated infrastructure and dedicated model endpoints for 
                maximum performance, reliability, and data privacy.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <Headphones className="h-12 w-12 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Concierge Support</h3>
              <p className="text-gray-400 leading-relaxed">
                24/7 priority support with a dedicated account manager and 
                solution architects to help you scale.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-3xl p-12 border border-white/10 mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Built for Scale</h2>
                <ul className="space-y-4">
                  {[
                    "Single Sign-On (SSO) & SAML integration",
                    "Custom Data Processing Agreements (DPA)",
                    "On-premise & Private Cloud deployment options",
                    "Unlimited workspace members and AI agents",
                    "Advanced analytics and ROI tracking",
                    "Custom agent training and fine-tuning"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <Users className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">Unlimited</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Users</div>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <BarChart3 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">99.99%</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Uptime SLA</div>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <Building2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">Global</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Deployments</div>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">SOC 2</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Compliant</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to transform your organization?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">View Pricing Tiers</Link>
              </Button>
            </div>
          </div>

          <div className="mt-20 text-center">
            <Link href="/" className="text-emerald-400 hover:underline">Back to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
