import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, Zap, Activity, Database, 
  Settings, BarChart3, Cpu, Network 
} from 'lucide-react'

const DeepMindPanel = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Brain },
    { id: 'quantum', label: 'Quantum Processing', icon: Zap },
    { id: 'learning', label: 'Deep Learning', icon: Activity },
    { id: 'neural', label: 'Neural Networks', icon: Network },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const quantumMetrics = [
    { label: 'Quantum Cores', value: '128', change: '+16', color: 'var(--accent-primary)' },
    { label: 'Processing Power', value: '2.4 PHz', change: '+15%', color: 'var(--success)' },
    { label: 'Neural Efficiency', value: '97.8%', change: '+2.3%', color: 'var(--success)' },
    { label: 'Learning Rate', value: '94.2%', change: '+8.1%', color: 'var(--accent-primary)' }
  ]

  const quantumProcesses = [
    { 
      id: 'QP-001', 
      name: 'Route Optimization Matrix',
      status: 'active',
      cores: 32,
      efficiency: '98.4%',
      runtime: '2h 15m',
      priority: 'high'
    },
    { 
      id: 'QP-002', 
      name: 'Predictive Maintenance AI',
      status: 'learning',
      cores: 24,
      efficiency: '94.7%',
      runtime: '45m',
      priority: 'medium'
    },
    { 
      id: 'QP-003', 
      name: 'Supply Chain Quantum Model',
      status: 'active',
      cores: 48,
      efficiency: '96.2%',
      runtime: '3h 42m',
      priority: 'high'
    },
    { 
      id: 'QP-004', 
      name: 'Risk Assessment Engine',
      status: 'idle',
      cores: 16,
      efficiency: '91.8%',
      runtime: '12m',
      priority: 'low'
    }
  ]

  const neuralNetworks = [
    { 
      name: 'Logistics Optimization Network',
      layers: 24,
      neurons: '2.4M',
      accuracy: '97.2%',
      status: 'training'
    },
    { 
      name: 'Demand Prediction Network',
      layers: 18,
      neurons: '1.8M',
      accuracy: '94.8%',
      status: 'active'
    },
    { 
      name: 'Autonomous Decision Network',
      layers: 32,
      neurons: '3.2M',
      accuracy: '98.6%',
      status: 'active'
    },
    { 
      name: 'Pattern Recognition Network',
      layers: 16,
      neurons: '1.2M',
      accuracy: '92.4%',
      status: 'optimizing'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            {/* Quantum Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {quantumMetrics.map((metric, index) => (
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

            {/* Quantum Deep Mind Visualization */}
            <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Quantum Deep Mind Core
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '200px',
                  height: '200px',
                  border: '2px solid var(--accent-primary)',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '150px',
                  height: '150px',
                  border: '2px solid var(--accent-secondary)',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite 0.5s'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '100px',
                  height: '100px',
                  border: '2px solid var(--success)',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite 1s'
                }} />
                <Brain size={48} style={{ color: 'var(--accent-primary)', zIndex: 10 }} />
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                    Quantum Processing Active
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    128 Quantum Cores • 2.4 PHz Processing Power
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Quantum Activity */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Recent Quantum Processing Activity
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { process: 'Route Optimization', action: 'Optimized 247 delivery routes', time: '3 min ago', efficiency: '98.4%' },
                  { process: 'Predictive Analysis', action: 'Generated demand forecast for next 30 days', time: '12 min ago', efficiency: '96.7%' },
                  { process: 'Risk Assessment', action: 'Identified 3 high-risk route segments', time: '28 min ago', efficiency: '94.2%' },
                  { process: 'Neural Learning', action: 'Completed training cycle for logistics model', time: '1 hour ago', efficiency: '97.8%' }
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
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{activity.process}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{activity.action}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activity.time}</div>
                      <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '500' }}>
                        {activity.efficiency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'quantum':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Quantum Processing Units
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {quantumProcesses.map((process) => (
                  <div key={process.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: `1px solid ${
                      process.priority === 'high' ? 'var(--error)' : 
                      process.priority === 'medium' ? 'var(--warning)' : 'var(--success)'
                    }`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: process.status === 'active' ? 'var(--success)' : 
                                   process.status === 'learning' ? 'var(--warning)' : 'var(--text-muted)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Cpu size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {process.id} - {process.name}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Runtime: {process.runtime} • {process.cores} cores
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {process.efficiency}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Efficiency
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: process.status === 'active' ? 'var(--success)' : 
                                   process.status === 'learning' ? 'var(--warning)' : 'var(--text-muted)',
                        color: 'white'
                      }}>
                        {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'neural':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Neural Network Architecture
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {neuralNetworks.map((network, index) => (
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
                        background: network.status === 'active' ? 'var(--success)' : 
                                   network.status === 'training' ? 'var(--warning)' : 'var(--accent-primary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Network size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {network.name}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {network.layers} layers • {network.neurons} neurons
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {network.accuracy}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Accuracy
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: network.status === 'active' ? 'var(--success)' : 
                                   network.status === 'training' ? 'var(--warning)' : 'var(--accent-primary)',
                        color: 'white'
                      }}>
                        {network.status.charAt(0).toUpperCase() + network.status.slice(1)}
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
          Quantum Deep Mind
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Advanced quantum computing and deep learning intelligence
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

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}

export default DeepMindPanel
