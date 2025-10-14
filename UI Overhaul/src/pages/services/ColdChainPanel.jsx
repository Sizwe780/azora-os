import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Snowflake, Thermometer, AlertTriangle, TrendingUp, 
  Settings, BarChart3, Package, MapPin 
} from 'lucide-react'

const ColdChainPanel = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Snowflake },
    { id: 'temperature', label: 'Temperature', icon: Thermometer },
    { id: 'shipments', label: 'Shipments', icon: Package },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const coldChainMetrics = [
    { label: 'Active Shipments', value: '47', change: '+8', color: 'var(--accent-primary)' },
    { label: 'Avg Temperature', value: '2.4°C', change: '+0.2°C', color: 'var(--success)' },
    { label: 'Compliance Rate', value: '99.2%', change: '+0.8%', color: 'var(--success)' },
    { label: 'Critical Alerts', value: '2', change: '-3', color: 'var(--warning)' }
  ]

  const shipments = [
    { 
      id: 'CC-001', 
      product: 'Pharmaceutical Vaccines', 
      temperature: '2.1°C',
      targetRange: '2-8°C',
      status: 'optimal',
      location: 'En route to Cape Town',
      eta: '2 hours',
      driver: 'John Smith'
    },
    { 
      id: 'CC-002', 
      product: 'Fresh Seafood', 
      temperature: '0.8°C',
      targetRange: '0-4°C',
      status: 'optimal',
      location: 'Durban Port',
      eta: '4 hours',
      driver: 'Sarah Johnson'
    },
    { 
      id: 'CC-003', 
      product: 'Dairy Products', 
      temperature: '6.2°C',
      targetRange: '2-6°C',
      status: 'warning',
      location: 'Johannesburg Hub',
      eta: '1 hour',
      driver: 'Mike Wilson'
    },
    { 
      id: 'CC-004', 
      product: 'Frozen Foods', 
      temperature: '-18.5°C',
      targetRange: '-18 to -15°C',
      status: 'optimal',
      location: 'Pretoria Depot',
      eta: '30 min',
      driver: 'Lisa Brown'
    }
  ]

  const temperatureAlerts = [
    { 
      shipment: 'CC-003', 
      type: 'Temperature Rising', 
      severity: 'medium',
      current: '6.2°C',
      target: '2-6°C',
      time: '15 min ago',
      action: 'Cooling system activated'
    },
    { 
      shipment: 'CC-007', 
      type: 'Sensor Malfunction', 
      severity: 'high',
      current: 'N/A',
      target: '2-8°C',
      time: '1 hour ago',
      action: 'Technician dispatched'
    },
    { 
      shipment: 'CC-012', 
      type: 'Door Breach', 
      severity: 'low',
      current: '3.1°C',
      target: '2-8°C',
      time: '2 hours ago',
      action: 'Door secured, monitoring'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            {/* Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {coldChainMetrics.map((metric, index) => (
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

            {/* Temperature Monitoring Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Active Shipments */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Active Cold Chain Shipments
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {shipments.slice(0, 4).map((shipment) => (
                    <div key={shipment.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: `1px solid ${
                        shipment.status === 'optimal' ? 'var(--success)' : 
                        shipment.status === 'warning' ? 'var(--warning)' : 'var(--error)'
                      }`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: shipment.status === 'optimal' ? 'var(--success)' : 
                                     shipment.status === 'warning' ? 'var(--warning)' : 'var(--error)'
                        }} />
                        <div>
                          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                            {shipment.id} - {shipment.product}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            {shipment.driver} • {shipment.location}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '600',
                          color: shipment.status === 'optimal' ? 'var(--success)' : 
                                 shipment.status === 'warning' ? 'var(--warning)' : 'var(--error)'
                        }}>
                          {shipment.temperature}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Target: {shipment.targetRange}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Temperature Chart Placeholder */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Temperature Trends
                </h3>
                <div style={{
                  height: '200px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <TrendingUp size={48} style={{ color: 'var(--accent-primary)', opacity: 0.3 }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>24h</span>
                      <span>12h</span>
                      <span>Now</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Average temperature across all shipments over the last 24 hours
                </div>
              </div>
            </div>
          </div>
        )

      case 'temperature':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Temperature Monitoring
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {shipments.map((shipment) => (
                  <div key={shipment.id} style={{
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
                        background: shipment.status === 'optimal' ? 'var(--success)' : 
                                   shipment.status === 'warning' ? 'var(--warning)' : 'var(--error)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Thermometer size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {shipment.id} - {shipment.product}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Target Range: {shipment.targetRange}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '20px', 
                          fontWeight: '700',
                          color: shipment.status === 'optimal' ? 'var(--success)' : 
                                 shipment.status === 'warning' ? 'var(--warning)' : 'var(--error)'
                        }}>
                          {shipment.temperature}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Current
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: shipment.status === 'optimal' ? 'var(--success)' : 
                                   shipment.status === 'warning' ? 'var(--warning)' : 'var(--error)',
                        color: 'white'
                      }}>
                        {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'alerts':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Temperature Alerts & Incidents
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {temperatureAlerts.map((alert, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: `1px solid ${
                      alert.severity === 'high' ? 'var(--error)' : 
                      alert.severity === 'medium' ? 'var(--warning)' : 'var(--success)'
                    }`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: alert.severity === 'high' ? 'var(--error)' : 
                                   alert.severity === 'medium' ? 'var(--warning)' : 'var(--success)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <AlertTriangle size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {alert.shipment} - {alert.type}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Current: {alert.current} | Target: {alert.target}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                          Action: {alert.action}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{alert.time}</div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '500',
                        background: alert.severity === 'high' ? 'var(--error)' : 
                                   alert.severity === 'medium' ? 'var(--warning)' : 'var(--success)',
                        color: 'white',
                        marginTop: '4px'
                      }}>
                        {alert.severity.toUpperCase()}
                      </div>
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
          Cold Chain Quantum Engine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Advanced temperature monitoring and cold chain management
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

export default ColdChainPanel
