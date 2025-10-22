"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Join the <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">African AI</span> Revolution
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Be part of the first AI ecosystem built by Africans, for Africans.
              Start learning, building, and earning with Azora today.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              asChild
            >
              <a href="https://learn.azora.world" className="flex items-center space-x-2">
                <span>Start Learning Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm"
              asChild
            >
              <a href="https://dev.azora.world" className="flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Developer Portal</span>
              </a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">50K+</div>
              <div className="text-gray-300">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">12</div>
              <div className="text-gray-300">African Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">$2M+</div>
              <div className="text-gray-300">AZR Distributed</div>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-300">Trusted by</span>
              </div>
              <div className="flex -space-x-2">
                {['🇿🇦', '🇳🇬', '🇰🇪', '🇬🇭', '🇷🇼'].map((flag, i) => (
                  <div key={i} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm">
                    {flag}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Universities, enterprises, and developers across Africa are already building the future with Azora.
            </p>
          </motion.div>

          {/* Sizwe Ngwenya Signature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">SN</span>
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">Sizwe Ngwenya</div>
                <div className="text-gray-400 text-sm">Founder, CEO & Chief Architect</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4 max-w-md mx-auto">
              "Azora is more than technology—it's our commitment to African innovation and economic empowerment."
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}