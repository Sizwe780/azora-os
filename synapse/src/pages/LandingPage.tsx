import React from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import EcosystemStats from '../components/EcosystemStats'

export default function LandingPage() {
  return (
    <>
      <SEO />
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
            Build the Future,
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Compliantly
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Africa's First Full Software Infrastructure. Learn, earn, and build with AI-powered compliance,
            decentralized finance, and enterprise-grade cloud solutions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-lg shadow-2xl hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all">
              🚀 Get Started Free
            </button>
            <Link to="/services" className="px-8 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-all">
              📖 Explore Services
            </Link>
          </div>

          {/* Ecosystem Stats */}
          <div className="mt-12 max-w-4xl mx-auto">
            <EcosystemStats />
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Azora OS?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're not just another platform. We're Africa's first comprehensive software infrastructure
              that combines learning, earning, compliance, and enterprise solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered Compliance',
                description: 'Automated regulatory compliance with AI-driven insights and real-time monitoring.'
              },
              {
                icon: '💎',
                title: 'AZR Token Economy',
                description: 'Earn real value through learning, contributions, and platform participation.'
              },
              {
                icon: '🏗️',
                title: 'Full Infrastructure',
                description: 'Complete ecosystem from development tools to enterprise cloud solutions.'
              }
            ].map((feature, i) => (
              <div key={i} className="text-center p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Overview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Ecosystem
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to learn, build, and scale in one integrated platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Learn & Earn',
                subdomain: 'learn.azora.world',
                icon: '📚',
                description: 'SAQA-aligned courses with AZR rewards',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                name: 'AZR Mint',
                subdomain: 'mint.azora.world',
                icon: '💰',
                description: 'Token minting and collateral management',
                color: 'from-green-500 to-emerald-500'
              },
              {
                name: 'Forge Marketplace',
                subdomain: 'marketplace.azora.world',
                icon: '⚒️',
                description: 'P2P marketplace for digital goods',
                color: 'from-purple-500 to-pink-500'
              },
              {
                name: 'Compliance Engine',
                subdomain: 'compliance.azora.world',
                icon: '🛡️',
                description: 'AI-powered regulatory compliance',
                color: 'from-red-500 to-orange-500'
              },
              {
                name: 'Enterprise Portal',
                subdomain: 'enterprise.azora.world',
                icon: '🏢',
                description: 'B2B solutions and cloud services',
                color: 'from-indigo-500 to-blue-500'
              },
              {
                name: 'Developer Portal',
                subdomain: 'dev.azora.world',
                icon: '�',
                description: 'API access and development tools',
                color: 'from-gray-700 to-gray-900'
              }
            ].map((service, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
                <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{service.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <a
                  href={`https://${service.subdomain}`}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  Visit {service.subdomain} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Credibility */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Organizations
            </h2>
            <p className="text-lg text-gray-600">
              From startups to enterprises, organizations trust Azora OS for compliance and innovation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {/* Placeholder for partner logos */}
            {['Partner 1', 'Partner 2', 'Partner 3', 'Partner 4'].map((partner, i) => (
              <div key={i} className="flex items-center justify-center p-8 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-semibold">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build the Future?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of students, developers, and enterprises already building with Azora OS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-cyan-600 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all">
              Start Building Today
            </button>
            <Link to="/contact" className="px-8 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-all">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
