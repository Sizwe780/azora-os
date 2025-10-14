import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, AlertTriangle, CheckCircle, Clock, 
  Truck, Users, BarChart3, Shield, Zap, ArrowRight 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()

  const userServices = [
    { id: 'analytics', name: 'Analytics Service', status: 'active', path: '/services/analytics' },
    { id: 'compliance', name: 'Compliance Engine', status: 'active', path: '/services/compliance' },
    { id: 'trip-planning', name: 'AI Trip Planning', status: 'active', path: '/services/trip-planning' },
    { id: 'document-vault', name: 'Document Vault', status: 'active', path: '/services/document-vault' },
  ]

  const availableUpgrades = [
    { id: 'neural-context', name: 'Neural Context Engine', price: 'R299/mo' },
    { id: 'deep-mind', name: 'Quantum Deep Mind', price: 'R599/mo' },
    { id: 'cold-chain', name: 'Cold Chain Quantum', price: 'R399/mo' },
    { id: 'hr-deputy', name: 'HR AI Deputy CEO', price: 'R799/mo' },
  ]

  const metrics = [
    { label: 'Active Fleet', value: '24', change: '+12%', icon: Truck, color: 'var(--accent-primary)' },
    { label: 'Compliance Score', value: '98%', change: '+2%', icon: Shield, color: 'var(--success)' },
    { label: 'Trip Efficiency', value: '94%', change: '+8%', icon: TrendingUp, color: 'var(--accent-primary)' },
    { label: 'Active Users', value: '156', change: '+24%', icon: Users, color: 'var(--success)' },
  ]

  const alerts = [
    { type: 'warning', message: 'Vehicle AZ-001 requires maintenance in 2 days', time: '10 min ago' },
    { type: 'success', message: 'Compliance audit completed successfully', time: '1 hour ago' },
    { type: 'info', message: 'New route optimization available', time: '2 hours ago' },
  ]

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          marginBottom: '8px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Welcome back, {user?.name}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Your sovereign logistics command center
        </p>
      </motion.div>

      {/* Upgrade Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card glow"
        style={{
          padding: '24px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          border: 'none',
          color: 'white'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              Unlock Full Azora Suite
            </h3>
            <p style={{ opacity: 0.9, marginBottom: '0' }}>
              First month free, 50% off next 2 months
            </p>
          </div>
          <Link to="/subscription" className="btn-secondary" style={{ background: 'white', color: 'var(--accent-primary)' }}>
            Upgrade Now
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}
      >
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Icon size={24} style={{ color: metric.color }} />
                <span style={{ 
                  color: metric.change.startsWith('+') ? 'var(--success)' : 'var(--error)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {metric.change}
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
                {metric.value}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {metric.label}
              </div>
            </div>
          )
        })}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Your Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>
            Your Active Services
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {userServices.map((service) => (
              <Link
                key={service.id}
                to={service.path}
                className="card"
                style={{
                  padding: '20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = 'var(--shadow-glow)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'var(--shadow-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--accent-primary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BarChart3 size={20} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{service.name}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      Status: Active
                    </div>
                  </div>
                </div>
                <CheckCircle size={20} style={{ color: 'var(--success)' }} />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Sidebar */}
        <div>
          {/* Available Upgrades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ marginBottom: '32px' }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Available Upgrades
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {availableUpgrades.map((upgrade) => (
                <div key={upgrade.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{upgrade.name}</div>
                    <Zap size={16} style={{ color: 'var(--warning)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{upgrade.price}</span>
                    <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Unlock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              Recent Alerts
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {alerts.map((alert, index) => (
                <div key={index} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {alert.type === 'warning' && <AlertTriangle size={16} style={{ color: 'var(--warning)', marginTop: '2px' }} />}
                    {alert.type === 'success' && <CheckCircle size={16} style={{ color: 'var(--success)', marginTop: '2px' }} />}
                    {alert.type === 'info' && <Clock size={16} style={{ color: 'var(--accent-primary)', marginTop: '2px' }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>{alert.message}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{alert.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
