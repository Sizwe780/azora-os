"use client"

import { motion } from "framer-motion"
import { BookOpen, Coins, Store, Shield, Building2, Code, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EcosystemSection() {
  const services = [
    {
      name: 'Learn & Earn Academy',
      subdomain: 'learn.azora.world',
      icon: BookOpen,
      description: 'SAQA-aligned courses with AZR token rewards',
      color: 'from-blue-500 to-cyan-500',
      status: 'Live'
    },
    {
      name: 'AZR Mint',
      subdomain: 'mint.azora.world',
      icon: Coins,
      description: 'Token minting and DeFi collateral management',
      color: 'from-green-500 to-emerald-500',
      status: 'Live'
    },
    {
      name: 'Forge Marketplace',
      subdomain: 'marketplace.azora.world',
      icon: Store,
      description: 'P2P marketplace for digital goods and services',
      color: 'from-purple-500 to-pink-500',
      status: 'Beta'
    },
    {
      name: 'Compliance Engine',
      subdomain: 'compliance.azora.world',
      icon: Shield,
      description: 'AI-powered regulatory compliance platform',
      color: 'from-red-500 to-orange-500',
      status: 'Live'
    },
    {
      name: 'Enterprise Portal',
      subdomain: 'enterprise.azora.world',
      icon: Building2,
      description: 'B2B solutions and enterprise cloud services',
      color: 'from-indigo-500 to-blue-500',
      status: 'Live'
    },
    {
      name: 'Developer Portal',
      subdomain: 'dev.azora.world',
      icon: Code,
      description: 'API access and development tools',
      color: 'from-gray-700 to-gray-900',
      status: 'Live'
    }
  ]

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Complete <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Ecosystem</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to learn, build, and scale in one integrated platform.
            From education to enterprise solutions, all powered by African intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-cyan-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  service.status === 'Live'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {service.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">
                {service.name}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {service.description}
              </p>

              <Button
                variant="ghost"
                className="w-full justify-between text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 p-0 h-auto font-medium"
                asChild
              >
                <a href={`https://${service.subdomain}`} className="flex items-center justify-between w-full px-3 py-2 rounded-lg">
                  <span>Visit {service.subdomain}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* African Innovation Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">African Innovation at Scale</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Every component of our ecosystem is designed with African markets, African users, and African innovation in mind.
            From our AI models trained on African languages to our compliance systems understanding African regulations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['🇿🇦 South Africa', '🇳🇬 Nigeria', '🇰🇪 Kenya', '🇬🇭 Ghana', '🇷🇼 Rwanda', '🇺🇬 Uganda'].map((country, i) => (
              <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-sm">
                {country}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}