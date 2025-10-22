"use client"

import { motion } from "framer-motion"
import {
  Shield,
  Database,
  FileText,
  Key,
  Users,
  CreditCard,
  Eye,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Globe,
  Coins,
  BookOpen,
  Cloud,
  CheckCircle,
  ExternalLink
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const services = [
  {
    name: "Azora Vault",
    description: "Secure asset custody and decentralized data management",
    icon: Shield,
    url: "https://vault.azora.world",
    status: "active",
    features: ["Encrypted Storage", "Access Control", "AZR Transactions"]
  },
  {
    name: "Azora Mint",
    description: "Convert AZR tokens to ZAR with neural trust scoring",
    icon: Coins,
    url: "https://mint.azora.world",
    status: "active",
    features: ["Anti-Bank Protocol", "Trust Scoring", "Instant Conversion"]
  },
  {
    name: "Learn & Earn Academy",
    description: "SAQA-accredited learning platform with AZR rewards",
    icon: BookOpen,
    url: "https://learn.azora.world",
    status: "active",
    features: ["SAQA Accredited", "AZR Rewards", "AI Teaching"]
  },
  {
    name: "Azora Forge",
    description: "Decentralized marketplace for digital goods and services",
    icon: Database,
    url: "https://forge.azora.world",
    status: "active",
    features: ["P2P Trading", "AZR Payments", "Secure Escrow"]
  },
  {
    name: "Azora Signal",
    description: "Real-time African intelligence and market signals",
    icon: TrendingUp,
    url: "https://signal.azora.world",
    status: "active",
    features: ["AI Signals", "African Markets", "Real-time Data"]
  },
  {
    name: "Azora Council",
    description: "Decentralized governance and decision-making platform",
    icon: Users,
    url: "https://council.azora.world",
    status: "active",
    features: ["Trust-weighted Voting", "Proposals", "Governance"]
  },
  {
    name: "Azora Pulse",
    description: "Real-time intelligence and analytics platform",
    icon: Activity,
    url: "https://pulse.azora.world",
    status: "active",
    features: ["Ecosystem Analytics", "Health Monitoring", "Insights"]
  },
  {
    name: "Azora Atlas",
    description: "Decentralized knowledge mapping and navigation",
    icon: Globe,
    url: "https://atlas.azora.world",
    status: "active",
    features: ["Knowledge Graph", "Semantic Search", "Network Mapping"]
  },
  {
    name: "Enterprise Portal",
    description: "Unified portal for enterprise clients and services",
    icon: Cloud,
    url: "https://enterprise.azora.world",
    status: "active",
    features: ["Service Integration", "Billing", "Support"]
  },
  {
    name: "Developer Portal",
    description: "API management, documentation, and sandbox environment",
    icon: Zap,
    url: "https://dev.azora.world",
    status: "active",
    features: ["API Docs", "Sandbox", "Rate Limiting"]
  }
]

const quickStats = [
  {
    label: "Active Users",
    value: "12,847",
    change: "+12.5%",
    trend: "up"
  },
  {
    label: "AZR Minted Today",
    value: "2,450.75",
    change: "+8.2%",
    trend: "up"
  },
  {
    label: "Courses Completed",
    value: "156",
    change: "+23.1%",
    trend: "up"
  },
  {
    label: "Active Proposals",
    value: "8",
    change: "-2",
    trend: "down"
  }
]

export function CommandCenterSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Azora Command Center
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your centralized hub for all Azora OS services. Access, monitor, and manage the entire ecosystem from one place.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {quickStats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className="w-full group-hover:bg-green-600 group-hover:text-white transition-colors"
                      variant="outline"
                      asChild
                    >
                      <a href={service.url} target="_blank" rel="noopener noreferrer">
                        Access Service
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience African Intelligence?
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Join thousands of users already building the future with Azora OS. Start with any service or explore our comprehensive ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                Schedule Demo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}