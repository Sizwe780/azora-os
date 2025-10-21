import React, { useState, useEffect } from 'react'

interface EcosystemStats {
  activeUsers: number
  azrMintedToday: number
  coursesCompleted: number
  transactionsToday: number
  trustScoreAverage: number
  lastUpdated: string
}

export default function EcosystemStats() {
  const [stats, setStats] = useState<EcosystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEcosystemStats()
    // Update stats every 5 minutes
    const interval = setInterval(fetchEcosystemStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchEcosystemStats = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // In production, this would fetch from Azora Pulse API:
      // const response = await fetch('https://pulse.azora.world/api/stats/public')
      // const data = await response.json()

      // For demo purposes, simulate API call with realistic data
      const mockStats: EcosystemStats = {
        activeUsers: Math.floor(Math.random() * 5000) + 15000, // 15k-20k
        azrMintedToday: Math.floor(Math.random() * 10000) + 5000, // 5k-15k
        coursesCompleted: Math.floor(Math.random() * 500) + 200, // 200-700
        transactionsToday: Math.floor(Math.random() * 2000) + 1000, // 1k-3k
        trustScoreAverage: Math.floor(Math.random() * 10) + 80, // 80-90
        lastUpdated: new Date().toISOString()
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStats(mockStats)
    } catch (err) {
      setError('Failed to load ecosystem stats')
      console.error('Error fetching ecosystem stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ecosystem Stats</h3>
          <p className="text-gray-600 text-sm">
            {error || 'Unable to load real-time statistics'}
          </p>
          <button
            onClick={fetchEcosystemStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const statItems = [
    {
      label: 'Active Users',
      value: formatNumber(stats.activeUsers),
      icon: '👥',
      change: '+12%'
    },
    {
      label: 'AZR Minted Today',
      value: formatNumber(stats.azrMintedToday),
      icon: '🪙',
      change: '+8%'
    },
    {
      label: 'Courses Completed',
      value: formatNumber(stats.coursesCompleted),
      icon: '🎓',
      change: '+15%'
    },
    {
      label: 'Transactions Today',
      value: formatNumber(stats.transactionsToday),
      icon: '💱',
      change: '+5%'
    }
  ]

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Ecosystem Stats</h3>
        <p className="text-sm text-gray-600">
          Real-time activity across the Azora OS network
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statItems.map((item, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {item.value}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {item.label}
            </div>
            <div className="text-xs text-green-600 font-medium">
              {item.change} vs yesterday
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Average Trust Score: {stats.trustScoreAverage}/100</span>
          <span>Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )
}