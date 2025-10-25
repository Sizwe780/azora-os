"use client"

import { Star, TrendingUp, Award, Users, Search } from "lucide-react"
import { useState } from "react"

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", label: "All Services" },
    { id: "ai", label: "AI Reasoning" },
    { id: "blockchain", label: "Blockchain" },
    { id: "data", label: "Data Science" },
    { id: "security", label: "Security" },
  ]

  const listings = [
    {
      id: 1,
      title: "AI Model Training & Optimization",
      provider: "Aridane Cojo Ruiz",
      avatar: "/professional-portrait.png",
      rating: 4.9,
      reviews: 127,
      price: "250 AZR",
      category: "ai",
      description: "Expert AI model training with 98% accuracy improvement",
      deliveryTime: "3-5 days",
      level: "Expert",
    },
    {
      id: 2,
      title: "Smart Contract Audit & Security",
      provider: "Sarah Chen",
      avatar: "/professional-woman-portrait.png",
      rating: 5.0,
      reviews: 89,
      price: "500 AZR",
      category: "blockchain",
      description: "Comprehensive smart contract security audits",
      deliveryTime: "5-7 days",
      level: "Expert",
    },
    {
      id: 3,
      title: "Neural Network Architecture Design",
      provider: "Marcus Webb",
      avatar: "/professional-man-portrait.png",
      rating: 4.8,
      reviews: 156,
      price: "350 AZR",
      category: "ai",
      description: "Custom neural network design for complex problems",
      deliveryTime: "7-10 days",
      level: "Expert",
    },
    {
      id: 4,
      title: "Blockchain Integration Consulting",
      provider: "Elena Rodriguez",
      avatar: "/professional-woman-portrait.png",
      rating: 4.9,
      reviews: 94,
      price: "400 AZR",
      category: "blockchain",
      description: "End-to-end blockchain integration services",
      deliveryTime: "5-7 days",
      level: "Expert",
    },
  ]

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 text-balance">The Forge</h1>
          <p className="text-muted-foreground text-lg">Peer-to-Peer Knowledge & Service Exchange powered by AZORA</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search services, skills, or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-primary/20 text-primary glow-primary"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">2,847</div>
              <div className="text-sm text-muted-foreground">Active Providers</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold">12.4K</div>
              <div className="text-sm text-muted-foreground">Services Listed</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <div className="text-2xl font-bold">98.5%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredListings.map((listing) => (
          <div key={listing.id} className="glass rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={listing.avatar || "/placeholder.svg"}
                alt={listing.provider}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{listing.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{listing.provider}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-medium">
                    {listing.level}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-4">{listing.description}</p>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-chart-4 fill-chart-4" />
                <span className="font-medium">{listing.rating}</span>
                <span className="text-muted-foreground">({listing.reviews})</span>
              </div>
              <div className="text-muted-foreground">Delivery: {listing.deliveryTime}</div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <div className="text-sm text-muted-foreground">Starting at</div>
                <div className="text-2xl font-bold text-primary">{listing.price}</div>
              </div>
              <button className="px-6 py-3 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors glow-primary">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
