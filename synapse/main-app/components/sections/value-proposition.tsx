"use client"

import { motion } from "framer-motion"
import { Brain, Shield, Zap, Globe, Users, Award } from "lucide-react"

export function ValueProposition() {
  const features = [
    {
      icon: Brain,
      title: 'African AI Intelligence',
      description: 'Advanced AI systems trained on African data, understanding African contexts, languages, and cultural nuances.',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Shield,
      title: 'AI-Powered Compliance',
      description: 'Automated regulatory compliance with AI-driven insights, real-time monitoring, and predictive analytics.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Decentralized Finance',
      description: 'Full DeFi infrastructure with African market focus, including stablecoins, lending, and cross-border payments.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Globe,
      title: 'Enterprise Cloud',
      description: 'Scalable cloud infrastructure designed for African enterprises with local data sovereignty and compliance.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Users,
      title: 'Learn & Earn Economy',
      description: 'SAQA-aligned education with AZR token rewards, creating sustainable learning incentives.',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Award,
      title: 'African Innovation Hub',
      description: 'Showcasing African talent and innovation through our comprehensive development platform.',
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Azora OS</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're not just another platform. We're Africa's first comprehensive software infrastructure
            that combines learning, earning, compliance, and enterprise solutions—all powered by African intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-cyan-200"
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover effect background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
            </motion.div>
          ))}
        </div>

        {/* African Intelligence Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-full px-6 py-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🇿🇦</span>
            </div>
            <span className="text-gray-700 font-medium">Built by Africans, for Africa, showcasing African intelligence</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}