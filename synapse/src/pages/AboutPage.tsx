import React from 'react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Azora OS
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Africa's first comprehensive software infrastructure platform, built to empower the next generation
            of innovators, entrepreneurs, and enterprises through technology, education, and economic opportunity.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To democratize access to world-class technology infrastructure and education, enabling Africans
              to build, learn, and thrive in the global digital economy. We believe in creating systems that
              are not just powerful, but also fair, compliant, and sustainable.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🚀</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600">
              A trillion-dollar African technology ecosystem where innovation flourishes, skills are valued,
              and economic opportunity is accessible to all. We're building the infrastructure that will
              power Africa's digital transformation and global leadership.
            </p>
          </div>
        </div>

        {/* Constitutional Principles */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Constitutional Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🛡️',
                title: 'Compliance First',
                description: 'Every system we build prioritizes regulatory compliance and ethical standards.'
              },
              {
                icon: '🤖',
                title: 'AI-Powered',
                description: 'Leveraging artificial intelligence to enhance efficiency, personalization, and decision-making.'
              },
              {
                icon: '💎',
                title: 'Token Economics',
                description: 'Fair value exchange through AZR tokens that reward contribution and participation.'
              },
              {
                icon: '🌍',
                title: 'African Centered',
                description: 'Designed for African contexts while maintaining global standards and interoperability.'
              },
              {
                icon: '📚',
                title: 'Education Focused',
                description: 'Learning and skill development at the core of everything we build.'
              },
              {
                icon: '🔗',
                title: 'Interconnected',
                description: 'Seamless integration across all services for a unified user experience.'
              }
            ].map((principle, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{principle.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{principle.title}</h3>
                <p className="text-gray-600 text-sm">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What Sets Us Apart */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Sets Azora OS Apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Complete Ecosystem',
                description: 'Unlike fragmented solutions, Azora OS provides a complete, integrated platform covering education, finance, compliance, and enterprise services.',
                icon: '🔗'
              },
              {
                title: 'African Innovation',
                description: 'Built by Africans for Africa, understanding local contexts, regulations, and opportunities while maintaining global standards.',
                icon: '🇿🇦'
              },
              {
                title: 'Token-Powered Economics',
                description: 'Real economic value through AZR tokens that align incentives and create sustainable growth for all participants.',
                icon: '💰'
              },
              {
                title: 'AI-First Architecture',
                description: 'Artificial intelligence integrated throughout the platform to enhance learning, compliance, and decision-making processes.',
                icon: '🤖'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section (Placeholder) */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Team</h2>
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Azora OS is built by a diverse team of engineers, educators, compliance experts, and entrepreneurs
              united by a vision of African technological leadership.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { role: 'Engineering', count: '15+' },
                { role: 'Education', count: '8+' },
                { role: 'Compliance', count: '5+' },
                { role: 'Business', count: '6+' },
                { role: 'Design', count: '4+' },
                { role: 'Operations', count: '3+' }
              ].map((team, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 mb-2">{team.count}</div>
                  <div className="text-gray-600">{team.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}