import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Store, TrendingUp, Package, Users, 
  BarChart3, Settings, Plus, Eye 
} from 'lucide-react'

const RetailPartnerPanel = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'partners', label: 'Partners', icon: Store },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const partners = [
    { id: 1, name: 'SuperMart Chain', status: 'active', orders: 245, revenue: 'R125,000' },
    { id: 2, name: 'QuickStop Stores', status: 'active', orders: 189, revenue: 'R89,500' },
    { id: 3, name: 'FreshMart', status: 'pending', orders: 67, revenue: 'R34,200' },
    { id: 4, name: 'CityMall', status: 'active', orders: 312, revenue: 'R156,800' }
  ]

  const metrics = [
    { label: 'Active Partners', value: '24', change: '+12%', color: 'var(--success)' },
    { label: 'Monthly Orders', value: '1,847', change: '+23%', color: 'var(--accent-primary)' },
    { label: 'Revenue', value: 'R485,200', change: '+18%', color: 'var(--success)' },
    { label: 'Avg Order Value', value: 'R263', change: '+5%', color: 'var(--accent-primary)' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            {/* Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {metrics.map((metric, index) => (
                <div key={index} className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                    {metric.value}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {metric.label}
                    </span>
                    <span style={{ color: metric.color, fontSize: '14px', fontWeight: '500' }}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Recent Partner Activity
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { partner: 'SuperMart Chain', action: 'New order placed', time: '5 min ago', status: 'success' },
                  { partner: 'CityMall', action: 'Inventory updated', time: '15 min ago', status: 'info' },
                  { partner: 'QuickStop Stores', action: 'Payment received', time: '1 hour ago', status: 'success' },
                  { partner: 'FreshMart', action: 'Partnership pending approval', time: '2 hours ago', status: 'warning' }
                ].map((activity, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{activity.partner}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{activity.action}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activity.time}</div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: activity.status === 'success' ? 'var(--success)' : 
                                   activity.status === 'warning' ? 'var(--warning)' : 'var(--accent-primary)',
                        marginLeft: 'auto',
                        marginTop: '4px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'partners':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Partner Management</h3>
              <button className="btn-primary">
                <Plus size={16} />
                Add Partner
              </button>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {partners.map((partner) => (
                  <div key={partner.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--accent-primary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Store size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{partner.name}</div>
                        <div style={{ 
                          color: partner.status === 'active' ? 'var(--success)' : 'var(--warning)',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>{partner.orders}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Orders</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>{partner.revenue}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Revenue</div>
                      </div>
                      <button className="btn-secondary">
                        <Eye size={16} />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              This section is under development
            </p>
          </div>
        )
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Retail Partner Integration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Manage retail partnerships and streamline order fulfillment
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderBottom: '1px solid var(--border-primary)',
        paddingBottom: '16px'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  )
}

export default RetailPartnerPanel
