import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, Navigation, Truck, Clock, 
  Settings, BarChart3, Zap, Eye 
} from 'lucide-react'

const TrackingEnginePanel = () => {
  const [activeTab, setActiveTab] = useState('live')

  const tabs = [
    { id: 'live', label: 'Live Tracking', icon: MapPin },
    { id: 'routes', label: 'Routes', icon: Navigation },
    { id: 'vehicles', label: 'Vehicles', icon: Truck },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const liveVehicles = [
    { 
      id: 'AZ-001', 
      driver: 'John Smith',
      status: 'in-transit',
      location: 'N1 Highway, Johannesburg',
      destination: 'Cape Town',
      progress: 45,
      eta: '4h 23m',
      speed: '85 km/h'
    },
    { 
      id: 'AZ-003', 
      driver: 'Sarah Johnson',
      status: 'loading',
      location: 'Durban Port',
      destination: 'Pretoria',
      progress: 0,
      eta: '6h 15m',
      speed: '0 km/h'
    },
    { 
      id: 'AZ-007', 
      driver: 'Mike Wilson',
      status: 'in-transit',
      location: 'R21 Highway, Pretoria',
      destination: 'OR Tambo Airport',
      progress: 78,
      eta: '45m',
      speed: '72 km/h'
    },
    { 
      id: 'AZ-012', 
      driver: 'Lisa Brown',
      status: 'delivered',
      location: 'Cape Town CBD',
      destination: 'Cape Town CBD',
      progress: 100,
      eta: 'Completed',
      speed: '0 km/h'
    }
  ]

  const routes = [
    { 
      id: 'RT-001', 
      name: 'Johannesburg to Cape Town',
      distance: '1,398 km',
      duration: '14h 30m',
      vehicles: 8,
      status: 'active'
    },
    { 
      id: 'RT-002', 
      name: 'Durban to Pretoria',
      distance: '568 km',
      duration: '6h 15m',
      vehicles: 5,
      status: 'active'
    },
    { 
      id: 'RT-003', 
      name: 'Port Elizabeth to East London',
      distance: '302 km',
      duration: '3h 45m',
      vehicles: 3,
      status: 'maintenance'
    },
    { 
      id: 'RT-004', 
      name: 'Bloemfontein Circuit',
      distance: '156 km',
      duration: '2h 20m',
      vehicles: 2,
      status: 'active'
    }
  ]

  const trackingMetrics = [
    { label: 'Active Vehicles', value: '24', change: '+3', color: 'var(--success)' },
    { label: 'Avg Speed', value: '68 km/h', change: '+5%', color: 'var(--accent-primary)' },
    { label: 'On-Time Delivery', value: '94.2%', change: '+2.1%', color: 'var(--success)' },
    { label: 'Route Efficiency', value: '91.8%', change: '+3.2%', color: 'var(--accent-primary)' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'live':
        return (
          <div>
            {/* Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {trackingMetrics.map((metric, index) => (
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

            {/* Live Tracking */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Map Placeholder */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Live Vehicle Tracking
                </h3>
                <div style={{
                  height: '400px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <MapPin size={64} style={{ color: 'var(--accent-primary)', opacity: 0.3 }} />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                      Quantum Tracking Map
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Real-time vehicle positions and routes
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Status */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Vehicle Status
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {liveVehicles.map((vehicle) => (
                    <div key={vehicle.id} style={{
                      padding: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: `1px solid ${
                        vehicle.status === 'in-transit' ? 'var(--accent-primary)' : 
                        vehicle.status === 'delivered' ? 'var(--success)' : 
                        vehicle.status === 'loading' ? 'var(--warning)' : 'var(--text-muted)'
                      }`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600' }}>{vehicle.id}</span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '500',
                          background: vehicle.status === 'in-transit' ? 'var(--accent-primary)' : 
                                     vehicle.status === 'delivered' ? 'var(--success)' : 
                                     vehicle.status === 'loading' ? 'var(--warning)' : 'var(--text-muted)',
                          color: 'white'
                        }}>
                          {vehicle.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {vehicle.driver}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {vehicle.location}
                      </div>
                      {vehicle.progress < 100 && (
                        <div>
                          <div style={{
                            width: '100%',
                            height: '4px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            marginBottom: '4px'
                          }}>
                            <div style={{
                              width: `${vehicle.progress}%`,
                              height: '100%',
                              background: 'var(--accent-primary)',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                            <span>ETA: {vehicle.eta}</span>
                            <span>{vehicle.speed}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'routes':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Route Management
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {routes.map((route) => (
                  <div key={route.id} style={{
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
                        background: route.status === 'active' ? 'var(--success)' : 'var(--warning)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Navigation size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {route.id} - {route.name}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {route.distance} • {route.duration}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {route.vehicles}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Vehicles
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: route.status === 'active' ? 'var(--success)' : 'var(--warning)',
                        color: 'white'
                      }}>
                        {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
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

      case 'vehicles':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Vehicle Tracking Overview
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {liveVehicles.map((vehicle) => (
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
                        background: vehicle.status === 'in-transit' ? 'var(--accent-primary)' : 
                                   vehicle.status === 'delivered' ? 'var(--success)' : 
                                   vehicle.status === 'loading' ? 'var(--warning)' : 'var(--text-muted)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Truck size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {vehicle.id} - {vehicle.driver}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {vehicle.location} → {vehicle.destination}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {vehicle.progress}%
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Progress
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {vehicle.speed}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Speed
                        </div>
                      </div>
                      <button className="btn-secondary">
                        <MapPin size={16} />
                        Track
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
          Quantum Tracking Engine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Real-time vehicle tracking and route optimization
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

export default TrackingEnginePanel
