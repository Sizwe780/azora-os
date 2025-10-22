"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Users, Award, CheckCircle, Star } from "lucide-react"

export function TrustSection() {
  const trustPoints = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Military-grade encryption and compliance with international standards including ISO 27001 and SOC 2 Type II.',
      color: 'text-green-600'
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your data stays yours. We never sell or share personal information. Built with African privacy laws in mind.',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Community Owned',
      description: 'AZR token holders govern the platform. Every decision is made by the community, for the community.',
      color: 'text-purple-600'
    },
    {
      icon: Award,
      title: 'SAQA Accredited',
      description: 'Our education platform is accredited by the South African Qualifications Authority for quality assurance.',
      color: 'text-orange-600'
    }
  ]

  const testimonials = [
    {
      name: 'Dr. Nomsa Mthembu',
      role: 'AI Researcher, University of Johannesburg',
      content: 'Azora represents the future of African AI. Their commitment to local innovation while maintaining global standards is remarkable.',
      rating: 5
    },
    {
      name: 'Kofi Asante',
      role: 'CEO, Ghana Tech Solutions',
      content: 'The compliance engine has transformed how we handle regulatory requirements. Finally, AI that understands African markets.',
      rating: 5
    },
    {
      name: 'Amara Okafor',
      role: 'Developer, Lagos',
      content: 'Building on Azora feels like home. The tools are powerful, the community is supportive, and the vision is inspiring.',
      rating: 5
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
            Trusted by <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Africa</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Built with African values, African security standards, and African innovation.
            Trusted by institutions, developers, and communities across the continent.
          </p>
        </motion.div>

        {/* Trust Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {trustPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                <point.icon className={`w-8 h-8 ${point.color}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {point.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-2xl p-8 mb-20"
        >
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Certifications & Compliance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              'ISO 27001',
              'SOC 2 Type II',
              'SAQA Accredited',
              'POPIA Compliant'
            ].map((cert, i) => (
              <div key={i} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="font-medium text-gray-900">{cert}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              <div>
                <div className="font-bold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* African Roots Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-full font-medium">
            <span>🇿🇦</span>
            <span>Built in South Africa, for Africa, by Africans</span>
            <span>🇿🇦</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}