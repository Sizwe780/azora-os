"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Users, Award } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzlDOTlBRiIgZmlsbC1vcGFjaXR5PSIwLjA0Ij4KPHBhdGggZD0iTTM2IDE0YzAuNTUyIDAgMSAwLjQ0OCAxIDFzLTAuNDQ4IDEtMSAxLTEtMC40NDgtMS0xIDAtLjQ0OC0xLTMxIDFjMC41NTIgMCAxIDAuNDQ4IDEtMXMtMC40NDggMS0xIDF6TTMwIDMwYzAuNTUyIDAgMSAwLjQ0OCAxIDFzLTAuNDQ4IDEtMSAxLTEtMC40NDgtMS0xIDAtLjQ0OC0xLTMwIDFjMC41NTIgMCAxIDAuNDQ4IDEtMXMtMC40NDggMS0xIDF6TTMwIDQ2YzAuNTUyIDAgMSAwLjQ0OCAxIDFzLTAuNDQ4IDEtMSAxLTEtMC40NDgtMS0xIDAtLjQ0OC0xLTMwIDFjMC41NTIgMCAxIDAuNDQ4IDEtMXMtMC40NDggMS0xIDF6Ii8+CjwvZz4KPC9nPgo8L3N2Zz4K')] bg-repeat"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* African Intelligence Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-4 py-2 text-sm font-medium">
            <MapPin className="w-4 h-4 mr-2" />
            Built in South Africa • Showcasing African Intelligence
          </Badge>
        </motion.div>

        {/* Founder Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">SN</span>
            </div>
            <div className="text-left">
              <p className="text-cyan-300 font-medium">Sizwe Ngwenya</p>
              <p className="text-sm text-gray-400">Founder, CEO & Chief Architect</p>
            </div>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-8xl font-bold mb-6 leading-tight"
        >
          Build the Future,
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            African Intelligence
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg md:text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
        >
          Africa's First Full Software Infrastructure. Learn, earn, and build with AI-powered compliance,
          decentralized finance, and enterprise-grade cloud solutions. Powered by South African innovation.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300">
            🚀 Start Building Free
          </Button>
          <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300">
            📖 Explore Ecosystem
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
        >
          {[
            { icon: Users, label: "Active Users", value: "10,000+" },
            { icon: Star, label: "Trust Score", value: "99.9%" },
            { icon: Award, label: "SAQA Accredited", value: "✓" },
            { icon: MapPin, label: "African Focus", value: "🇿🇦" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  )
}