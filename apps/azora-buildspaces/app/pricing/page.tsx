import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Check, Sparkles, Building2, Users } from "lucide-react"
import Link from "next/link"

const tiers = [
  {
    name: "Community",
    price: "Free",
    description: "For individual developers and open source contributors.",
    color: "emerald",
    features: [
      "8 AI agents with limited usage",
      "All 8 rooms (Code Chamber, Spec Chamber, etc.)",
      "1 active workspace",
      "Community support",
      "Constitutional AI validation",
      "Public repositories only",
    ],
    cta: "Get Started Free",
    href: "/workspace",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professional developers who need more power.",
    color: "purple",
    features: [
      "Unlimited AI agent usage",
      "All 8 rooms with full features",
      "10 active workspaces",
      "Priority support",
      "Private repositories",
      "Custom agent prompts",
      "Advanced analytics",
      "Team collaboration (up to 5)",
    ],
    cta: "Start Pro Trial",
    href: "/workspace",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and organizations that need scale and compliance.",
    color: "amber",
    features: [
      "Everything in Pro",
      "Unlimited workspaces",
      "SSO & SAML",
      "Dedicated support",
      "Custom LLM integration",
      "On-premise deployment",
      "SLA guarantees",
      "Compliance reporting",
      "Custom agent training",
      "Audit logs & governance",
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Pricing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Simple, Honest
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Pricing</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Start free. Scale when you&apos;re ready. No hidden fees, no surprises.
            </p>
          </div>
        </section>

        {/* Tiers */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div key={tier.name} className={`relative p-8 rounded-2xl bg-white/[0.02] border transition-all duration-300 hover:bg-white/[0.04] ${tier.popular ? "border-purple-500/40 shadow-lg shadow-purple-500/5" : "border-white/[0.06]"}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-gray-500">{tier.period}</span>}
                  </div>
                  <p className="text-sm text-gray-400 mb-8">{tier.description}</p>
                  <Link href={tier.href} className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${tier.popular ? "bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06]"}`}>
                    {tier.cta}
                  </Link>
                  <ul className="mt-8 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <Check className={`h-4 w-4 flex-shrink-0 text-${tier.color}-400`} />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is the Community plan really free?", a: "Yes — forever. We believe every developer should have access to ethical AI tools. The Community plan includes all 8 rooms with usage limits." },
                { q: "Can I switch plans anytime?", a: "Absolutely. Upgrade, downgrade, or cancel at any time. No lock-in contracts." },
                { q: "Do you offer student discounts?", a: "Yes! Students and educators get Pro free. Contact us with your .edu email." },
                { q: "What about open source projects?", a: "Open source projects get Pro features free. Apply through our OSS program." },
              ].map((faq, i) => (
                <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
              <div className="absolute inset-0 bg-[#0d1117]/70 backdrop-blur-sm" />
              <div className="relative border border-amber-500/20 rounded-2xl p-12 text-center">
                <Building2 className="h-10 w-10 text-amber-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Need Enterprise?</h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">Get custom pricing, dedicated support, SSO, and on-premise deployment for your organization.</p>
                <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all">
                  <Users className="h-4 w-4" /> Talk to Sales
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
