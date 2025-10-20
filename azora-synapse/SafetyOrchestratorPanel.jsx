import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, AlertTriangle, CheckCircle, Eye, 
  Settings, BarChart3, Users, MapPin 
} from 'lucide-react'

const SafetyOrchestratorPanel = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'monitoring', label: 'Monitoring', icon: Eye },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const safetyMetrics = [
    { label: 'Safety Score', value: '98.2%', change: '+1.2%', color: 'var(--success)' },
    { label: 'Active Incidents', value: '3', change: '-2', color: 'var(--warning)' },
    { label: 'Compliance Rate', value: '99.1%', change: '+0.5%', color: 'var(--success)' },
    { label: 'Risk Level', value: 'Low', change: 'Stable', color: 'var(--success)' }
  ]

  const incidents = [
    { 
      id: 'INC-001', 
      type: 'Speed Violation', 
      severity: 'medium', 
      vehicle: 'AZ-001',
      driver: 'John Smith',
      location: 'N1 Highway',
      time: '2 hours ago',
      status: 'investigating'
    },
    { 
      id: 'INC-002', 
      type: 'Hard Braking', 
      severity: 'low', 
      vehicle: 'AZ-003',
      driver: 'Sarah Johnson',
      location: 'Cape Town CBD',
      time: '4 hours ago',
      status: 'resolved'
    },
    { 
      id: 'INC-003', 
      type: 'Route Deviation', 
      severity: 'high', 
      vehicle: 'AZ-007',
      driver: 'Mike Wilson',
      location: 'Johannesburg',
      time: '6 hours ago',
      status: 'escalated'
    }
  ]

  const monitoringPoints = [
    { name: 'Driver Behavior', status: 'active', alerts: 2, coverage: '100%' },
    { name: 'Vehicle Health', status: 'active', alerts: 0, coverage: '98%' },
    { name: 'Route Safety', status: 'active', alerts: 1, coverage: '95%' },
    { name: 'Cargo Security', status: 'maintenance', alerts: 0, coverage: '92%' },
    { name: 'Environmental', status: 'active', alerts: 3, coverage: '100%' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            {/* Safety Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {safetyMetrics.map((metric, index) => (
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

            {/* Safety Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Recent Incidents */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Recent Safety Incidents
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {incidents.slice(0, 3).map((incident) => (
                    <div key={incident.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: incident.severity === 'high' ? 'var(--error)' : 
                                     incident.severity === 'medium' ? 'var(--warning)' : 'var(--success)'
                        }} />
                        <div>
                          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                            {incident.type} - {incident.vehicle}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            {incident.driver} • {incident.location}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{incident.time}</div>
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '500',
                          background: incident.status === 'resolved' ? 'var(--success)' : 
                                     incident.status === 'escalated' ? 'var(--error)' : 'var(--warning)',
                          color: 'white',
                          marginTop: '4px'
                        }}>
                          {incident.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Score Breakdown */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Safety Score Breakdown
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { category: 'Driver Behavior', score: 96, color: 'var(--success)' },
                    { category: 'Vehicle Safety', score: 99, color: 'var(--success)' },
                    { category: 'Route Compliance', score: 94, color: 'var(--warning)' },
                    { category: 'Emergency Response', score: 100, color: 'var(--success)' }
                  ].map((item, index) => (
                    <div key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{item.category}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.score}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${item.score}%`,
                          height: '100%',
                          background: item.color,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'incidents':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Safety Incident Management
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {incidents.map((incident) => (
                  <div key={incident.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: `1px solid ${
                      incident.severity === 'high' ? 'var(--error)' : 
                      incident.severity === 'medium' ? 'var(--warning)' : 'var(--success)'
                    }`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: incident.severity === 'high' ? 'var(--error)' : 
                                   incident.severity === 'medium' ? 'var(--warning)' : 'var(--success)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <AlertTriangle size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {incident.id} - {incident.type}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {incident.driver} • {incident.vehicle} • {incident.location}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{incident.time}</div>
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '500',
                          background: incident.status === 'resolved' ? 'var(--success)' : 
                                     incident.status === 'escalated' ? 'var(--error)' : 'var(--warning)',
                          color: 'white',
                          marginTop: '4px'
                        }}>
                          {incident.status}
                        </div>
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

      case 'monitoring':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Safety Monitoring Systems
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {monitoringPoints.map((point, index) => (
                  <div key={index} style={{
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
                        background: point.status === 'active' ? 'var(--success)' : 'var(--warning)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Eye size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{point.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Coverage: {point.coverage}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {point.alerts}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Active Alerts
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: point.status === 'active' ? 'var(--success)' : 'var(--warning)',
                        color: 'white'
                      }}>
                        {point.status.charAt(0).toUpperCase() + point.status.slice(1)}
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
          Universal Safety Orchestrator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Comprehensive safety monitoring and incident management system
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

export default SafetyOrchestratorPanel
