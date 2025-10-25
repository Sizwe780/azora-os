import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ServicePanel from '../../components/ServicePanel'
import axios from 'axios'

const RetailPartnerPanel = () => {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const stats = [
    { label: 'Active Partners', value: partners.length.toString(), change: '+12%' },
    { label: 'Revenue Generated', value: '$2.4M', change: '+8%' },
    { label: 'Orders Processed', value: '15,632', change: '+15%' },
    { label: 'Avg Order Value', value: '$156', change: '+5%' }
  ]

  const actions = [
    { label: 'Add Partner', onClick: () => console.log('Add partner') },
    { label: 'View Analytics', onClick: () => console.log('View analytics') }
  ]

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        // Try to fetch from Azora Forge service
        const response = await axios.get('http://localhost:4048/api/partners', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('azora-token')}`
          }
        })
        setPartners(response.data.partners || [])
      } catch (err) {
        // Fallback to mock data if service is not running
        console.log('Using mock data for partners')
        setPartners([
          { name: 'TechCorp Solutions', revenue: '$125K', growth: '+18%' },
          { name: 'Global Retail Inc', revenue: '$98K', growth: '+12%' },
          { name: 'SmartShop Ltd', revenue: '$87K', growth: '+9%' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPartners()
  }, [])

  if (loading) {
    return (
      <ServicePanel
        title="Retail Partner Management"
        description="Manage your retail partner network and track performance metrics"
        stats={stats}
        actions={actions}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ServicePanel>
    )
  }

  return (
    <ServicePanel
      title="Retail Partner Management"
      description="Manage your retail partner network and track performance metrics"
      stats={stats}
      actions={actions}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Partners</h3>
            <div className="space-y-3">
              {partners.map((partner, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{partner.name}</p>
                    <p className="text-sm text-muted-foreground">{partner.revenue}</p>
                  </div>
                  <span className="text-green-500 text-sm font-medium">{partner.growth}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'New partner onboarded', time: '2 hours ago', type: 'success' },
                { action: 'Revenue milestone reached', time: '1 day ago', type: 'achievement' },
                { action: 'Partner support ticket', time: '2 days ago', type: 'alert' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-foreground font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.type === 'success' ? 'bg-green-500/10 text-green-500' :
                    activity.type === 'achievement' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {activity.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ServicePanel>
  )
}

export default RetailPartnerPanel