import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, Zap, Activity, Database, 
  Settings, BarChart3, Network, Cpu 
} from 'lucide-react'

const NeuralContextPanel = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Brain },
    { id: 'models', label: 'AI Models', icon: Cpu },
    { id: 'training', label: 'Training', icon: Activity },
    { id: 'data', label: 'Data Sources', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const aiModels = [
    { 
      id: 'route-optimizer', 
      name: 'Route Optimization', 
      status: 'active', 
      accuracy: '94.2%',
      lastTrained: '2 hours ago',
      predictions: '12,847'
    },
    { 
      id: 'demand-predictor', 
      name: 'Demand Prediction', 
      status: 'training', 
      accuracy: '89.7%',
      lastTrained: '1 day ago',
      predictions: '8,923'
    },
    { 
      id: 'risk-assessor', 
      name: 'Risk Assessment', 
      status: 'active', 
      accuracy: '96.1%',
      lastTrained: '6 hours ago',
      predictions: '5,634'
    },
    { 
      id: 'maintenance-predictor', 
      name: 'Maintenance Prediction', 
      status: 'idle', 
      accuracy: '91.8%',
      lastTrained: '3 days ago',
      predictions: '3,421'
    }
  ]

  const dataSources = [
    { name: 'Vehicle Telemetry', status: 'connected', records: '2.4M', lastSync: '2 min ago' },
    { name: 'Traffic Data', status: 'connected', records: '890K', lastSync: '5 min ago' },
    { name: 'Weather API', status: 'connected', records: '156K', lastSync: '1 min ago' },
    { name: 'Customer Orders', status: 'syncing', records: '1.2M', lastSync: '10 min ago' },
    { name: 'Fleet Maintenance', status: 'connected', records: '45K', lastSync: '3 min ago' }
  ]

  const metrics = [
    { label: 'Active Models', value: '12', change: '+3', color: 'var(--success)' },
    { label: 'Predictions/Hour', value: '2,847', change: '+15%', color: 'var(--accent-primary)' },
    { label: 'Model Accuracy', value: '93.2%', change: '+2.1%', color: 'var(--success)' },
    { label: 'Data Points', value: '4.8M', change: '+24%', color: 'var(--accent-primary)' }
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

            {/* Neural Network Visualization */}
            <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Neural Network Activity
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                position: 'relative'
              }}>
                <Network size={64} style={{ color: 'var(--accent-primary)', opacity: 0.3 }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                    Neural Context Engine
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Processing 2,847 predictions per hour
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Recent AI Activity
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { model: 'Route Optimizer', action: 'Generated optimal route for 24 vehicles', time: '2 min ago', status: 'success' },
                  { model: 'Demand Predictor', action: 'Updated demand forecast for next week', time: '15 min ago', status: 'info' },
                  { model: 'Risk Assessor', action: 'Identified high-risk route segment', time: '32 min ago', status: 'warning' },
                  { model: 'Maintenance Predictor', action: 'Scheduled preventive maintenance', time: '1 hour ago', status: 'success' }
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
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{activity.model}</div>
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

      case 'models':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                AI Model Management
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {aiModels.map((model) => (
                  <div key={model.id} style={{
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
                        background: model.status === 'active' ? 'var(--success)' : 
                                   model.status === 'training' ? 'var(--warning)' : 'var(--text-muted)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Brain size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{model.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Last trained: {model.lastTrained}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {model.accuracy}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Accuracy
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {model.predictions}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Predictions
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: model.status === 'active' ? 'var(--success)' : 
                                   model.status === 'training' ? 'var(--warning)' : 'var(--text-muted)',
                        color: 'white'
                      }}>
                        {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'data':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Data Source Management
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {dataSources.map((source, index) => (
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
                        background: source.status === 'connected' ? 'var(--success)' : 'var(--warning)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Database size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{source.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Last sync: {source.lastSync}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {source.records}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Records
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: source.status === 'connected' ? 'var(--success)' : 'var(--warning)',
                        color: 'white'
                      }}>
                        {source.status.charAt(0).toUpperCase() + source.status.slice(1)}
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
          Neural Context Engine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Advanced AI-powered context understanding and decision making
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

export default NeuralContextPanel
