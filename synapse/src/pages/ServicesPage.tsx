import React from 'react'
import SEO from '../components/SEO'

export default function ServicesPage() {
  return (
    <>
      <SEO
        title="Services - Azora OS"
        description="Explore Azora OS services: Learn & Earn platform, Digital Asset Minting, Peer-to-Peer Marketplace, AI Compliance Tools, Enterprise Cloud Solutions, and Developer APIs."
        url="https://azora.world/services"
      />
      <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Azora OS Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete ecosystem of services designed to empower students, developers, and enterprises
            to build, learn, and scale compliantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: 'Learn & Earn Platform',
              subdomain: 'learn.azora.world',
              icon: '📚',
              description: 'SAQA-aligned courses with AZR token rewards. Master skills while earning real value.',
              features: ['AI-powered learning paths', 'AZR token rewards', 'SAQA accreditation', 'Progress tracking'],
              color: 'from-blue-500 to-cyan-500'
            },
            {
              name: 'AZR Mint',
              subdomain: 'mint.azora.world',
              icon: '💰',
              description: 'Secure wallet and collateral management for AZR tokens with fiat liquidity access.',
              features: ['Token wallet', 'Collateral management', 'Fiat swaps', 'Trust scoring'],
              color: 'from-green-500 to-emerald-500'
            },
            {
              name: 'Forge Marketplace',
              subdomain: 'marketplace.azora.world',
              icon: '⚒️',
              description: 'P2P marketplace for digital goods and services using AZR tokens.',
              features: ['Digital goods trading', 'Service listings', 'AZR payments', 'Escrow protection'],
              color: 'from-purple-500 to-pink-500'
            },
            {
              name: 'Compliance Engine',
              subdomain: 'compliance.azora.world',
              icon: '🛡️',
              description: 'AI-powered regulatory compliance monitoring and reporting platform.',
              features: ['Automated compliance', 'Risk assessment', 'Audit trails', 'Regulatory reporting'],
              color: 'from-red-500 to-orange-500'
            },
            {
              name: 'Enterprise Portal',
              subdomain: 'enterprise.azora.world',
              icon: '🏢',
              description: 'Unified B2B platform for logistics, cloud services, and enterprise solutions.',
              features: ['Multi-service access', 'Usage analytics', 'Billing management', 'Enterprise support'],
              color: 'from-indigo-500 to-blue-500'
            },
            {
              name: 'Developer Portal',
              subdomain: 'dev.azora.world',
              icon: '💻',
              description: 'Complete developer toolkit with APIs, documentation, and sandbox environments.',
              features: ['API documentation', 'Sandbox testing', 'Usage analytics', 'Developer support'],
              color: 'from-gray-700 to-gray-900'
            }
          ].map((service, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
              <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6`}>
                <span className="text-3xl">{service.icon}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={`https://${service.subdomain}`}
                className="inline-block w-full text-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                Visit {service.subdomain}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Custom Solutions?</h2>
            <p className="text-gray-600 mb-6">
              Our enterprise team can help design custom integrations and solutions tailored to your needs.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Contact Enterprise Sales
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}