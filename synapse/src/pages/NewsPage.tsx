import React, { useState } from 'react'

function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'news_page'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to subscribe')
      }

      setSubmitted(true)
      setEmail('')

    } catch (error) {
      console.error('Newsletter signup error:', error)
      setError(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-2">🎉</div>
        <p className="font-semibold">Welcome to the Azora community!</p>
        <p className="text-sm opacity-90">Check your email for confirmation.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </button>
      {error && <p className="text-red-200 text-sm mt-2">{error}</p>}
    </form>
  )
}

export default function NewsPage() {
  const newsArticles = [
    {
      id: 1,
      title: "Azora OS Launches Comprehensive Learning Platform",
      date: "October 21, 2025",
      excerpt: "Introducing learn.azora.world - a revolutionary educational platform that rewards learning with AZR tokens, combining education with economic incentives.",
      category: "Product Launch",
      readTime: "3 min read"
    },
    {
      id: 2,
      title: "AZR Token Economics: Building Sustainable Digital Economies",
      date: "October 18, 2025",
      excerpt: "Deep dive into the AZR token model, exploring how it creates value through learning incentives, marketplace transactions, and fiat liquidity access.",
      category: "Economics",
      readTime: "5 min read"
    },
    {
      id: 3,
      title: "Enterprise Solutions: Transforming Business Operations",
      date: "October 15, 2025",
      excerpt: "How Azora OS enterprise tools are revolutionizing compliance, logistics, and cloud infrastructure for South African businesses.",
      category: "Enterprise",
      readTime: "4 min read"
    },
    {
      id: 4,
      title: "Regulatory Compliance: Leading with Innovation",
      date: "October 12, 2025",
      excerpt: "Azora OS commitment to regulatory excellence, featuring AI-powered compliance tools and POPIA-compliant data management.",
      category: "Compliance",
      readTime: "3 min read"
    },
    {
      id: 5,
      title: "Marketplace Launch: Connecting Digital Creators",
      date: "October 10, 2025",
      excerpt: "The launch of marketplace.azora.world brings peer-to-peer digital goods trading to the African continent with AZR token integration.",
      category: "Marketplace",
      readTime: "4 min read"
    },
    {
      id: 6,
      title: "Constitutional AI: Ethical Framework for Digital Governance",
      date: "October 8, 2025",
      excerpt: "Exploring the constitutional principles that guide Azora OS AI systems, ensuring ethical, transparent, and accountable artificial intelligence.",
      category: "AI Ethics",
      readTime: "6 min read"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Azora OS News</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest developments, product launches, and insights from the Azora OS ecosystem.
            </p>
          </div>

          {/* Featured Article */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-12">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl h-64 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-2">🚀</div>
                    <div className="text-xl font-semibold">Featured Story</div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Product Launch
                  </span>
                  <span className="text-gray-500 text-sm">October 21, 2025</span>
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-500 text-sm">3 min read</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Azora OS Launches Comprehensive Learning Platform
                </h2>
                <p className="text-gray-700 mb-6">
                  Introducing learn.azora.world - a revolutionary educational platform that rewards learning with AZR tokens,
                  combining education with economic incentives to create sustainable digital economies.
                </p>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                  Read Full Article
                </button>
              </div>
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.slice(1).map((article) => (
              <article key={article.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    article.category === 'Economics' ? 'bg-green-100 text-green-800' :
                    article.category === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                    article.category === 'Compliance' ? 'bg-orange-100 text-orange-800' :
                    article.category === 'Marketplace' ? 'bg-pink-100 text-pink-800' :
                    article.category === 'AI Ethics' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {article.category}
                  </span>
                  <span className="text-gray-500 text-sm">{article.date}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">{article.readTime}</span>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Read more →
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mt-12 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-blue-100 mb-6 max-w-md mx-auto">
              Get the latest updates, product announcements, and insights from Azora OS delivered to your inbox.
            </p>
            <NewsletterSignup />
          </div>

          {/* Categories */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore by Category</h2>
            <div className="flex flex-wrap gap-3">
              {['All', 'Product Launch', 'Economics', 'Enterprise', 'Compliance', 'Marketplace', 'AI Ethics'].map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}