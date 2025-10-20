import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Truck, Battery, MapPin, Zap, 
  BarChart3, Settings, AlertTriangle, CheckCircle 
} from 'lucide-react'

const EVLeaderPanel = () => {
  const [activeTab, setActiveTab] = useState('fleet')

  const tabs = [
    { id: 'fleet', label: 'Fleet Status', icon: Truck },
    { id: 'charging', label: 'Charging', icon: Zap },
    { id: 'routes', label: 'Routes', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const vehicles = [
    { 
      id: 'EV-001', 
      model: 'Tesla Semi', 
      battery: 85, 
      status: 'active', 
      location: 'Johannesburg',
      range: '420km',
      driver: 'John Smith'
    },
    { 
      id: 'EV-002', 
      model: 'Rivian EDV', 
      battery: 62, 
      status: 'charging', 
      location: 'Cape Town',
      range: '280km',
      driver: 'Sarah Johnson'
    },
    { 
      id: 'EV-003', 
      model: 'Ford E-Transit', 
      battery: 34, 
      status: 'maintenance', 
      location: 'Durban',
      range: '150km',
      driver: 'Mike Wilson'
    },
    { 
      id: 'EV-004', 
      model: 'Mercedes eActros', 
      battery: 91, 
      status: 'active', 
      location: 'Pretoria',
      range: '380km',
      driver: 'Lisa Brown'
    }
  ]

  const chargingStations = [
    { id: 'CS-001', name: 'Sandton Charging Hub', available: 8, total: 12, power: '150kW' },
    { id: 'CS-002', name: 'OR Tambo Station', available: 3, total: 6, power: '350kW' },
    { id: 'CS-003', name: 'Cape Town Port', available: 15, total: 20, power: '150kW' },
    { id: 'CS-004', name: 'Durban Logistics', available: 6, total: 8, power: '250kW' }
  ]

  const metrics = [
    { label: 'Active Vehicles', value: '24', change: '+2', color: 'var(--success)' },
    { label: 'Avg Battery Level', value: '68%', change: '+5%', color: 'var(--accent-primary)' },
    { label: 'Energy Efficiency', value: '94%', change: '+3%', color: 'var(--success)' },
    { label: 'CO2 Saved', value: '2.4T', change: '+12%', color: 'var(--success)' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'fleet':
        return (
          <div>
            {/* Metrics */}
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

            {/* Vehicle List */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Fleet Overview
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} style={{
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
                        background: vehicle.status === 'active' ? 'var(--success)' : 
                                   vehicle.status === 'charging' ? 'var(--warning)' : 'var(--error)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Truck size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {vehicle.id} - {vehicle.model}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Driver: {vehicle.driver} • {vehicle.location}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <Battery size={16} style={{ color: 'var(--accent-primary)' }} />
                          <span style={{ fontSize: '16px', fontWeight: '600' }}>{vehicle.battery}%</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          {vehicle.range} range
                        </div>
                      </div>
                      
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: vehicle.status === 'active' ? 'var(--success)' : 
                                   vehicle.status === 'charging' ? 'var(--warning)' : 'var(--error)',
                        color: 'white'
                      }}>
                        {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'charging':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Charging Infrastructure
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {chargingStations.map((station) => (
                  <div key={station.id} style={{
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
                        <Zap size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{station.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {station.power} Fast Charging
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {station.available}/{station.total}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Available
                        </div>
                      </div>
                      
                      <div style={{
                        width: '60px',
                        height: '8px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(station.available / station.total) * 100}%`,
                          height: '100%',
                          background: station.available > station.total * 0.5 ? 'var(--success)' : 'var(--warning)'
                        }} />
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
          EV Leader Autonomous Operations
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Manage your electric vehicle fleet with autonomous intelligence
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

export default EVLeaderPanel
