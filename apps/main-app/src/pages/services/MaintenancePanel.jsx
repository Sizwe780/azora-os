import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Wrench, Calendar, AlertTriangle, CheckCircle, 
  Settings, BarChart3, Clock, Truck 
} from 'lucide-react'

const MaintenancePanel = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Wrench },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const maintenanceMetrics = [
    { label: 'Active Vehicles', value: '24', change: '+2', color: 'var(--success)' },
    { label: 'Scheduled Tasks', value: '18', change: '+5', color: 'var(--warning)' },
    { label: 'Overdue Items', value: '3', change: '-2', color: 'var(--error)' },
    { label: 'Avg Uptime', value: '97.8%', change: '+1.2%', color: 'var(--success)' }
  ]

  const scheduledMaintenance = [
    { 
      id: 'MAINT-001', 
      vehicle: 'AZ-001',
      type: 'Oil Change',
      priority: 'medium',
      dueDate: '2024-01-25',
      mileage: '15,000 km',
      estimatedCost: 'R850',
      status: 'scheduled'
    },
    { 
      id: 'MAINT-002', 
      vehicle: 'AZ-003',
      type: 'Brake Inspection',
      priority: 'high',
      dueDate: '2024-01-22',
      mileage: '22,500 km',
      estimatedCost: 'R1,200',
      status: 'overdue'
    },
    { 
      id: 'MAINT-003', 
      vehicle: 'AZ-007',
      type: 'Tire Rotation',
      priority: 'low',
      dueDate: '2024-01-30',
      mileage: '18,750 km',
      estimatedCost: 'R450',
      status: 'scheduled'
    },
    { 
      id: 'MAINT-004', 
      vehicle: 'AZ-012',
      type: 'Engine Service',
      priority: 'high',
      dueDate: '2024-01-28',
      mileage: '25,000 km',
      estimatedCost: 'R2,500',
      status: 'in-progress'
    }
  ]

  const maintenanceAlerts = [
    { 
      vehicle: 'AZ-001', 
      alert: 'Engine temperature high',
      severity: 'high',
      time: '15 min ago',
      action: 'Immediate inspection required'
    },
    { 
      vehicle: 'AZ-005', 
      alert: 'Brake pad wear detected',
      severity: 'medium',
      time: '2 hours ago',
      action: 'Schedule brake service'
    },
    { 
      vehicle: 'AZ-009', 
      alert: 'Oil change due soon',
      severity: 'low',
      time: '1 day ago',
      action: 'Schedule within 7 days'
    }
  ]

  const maintenanceHistory = [
    { 
      id: 'HIST-001', 
      vehicle: 'AZ-002',
      service: 'Complete Engine Overhaul',
      date: '2024-01-10',
      cost: 'R15,500',
      technician: 'Mike Johnson',
      status: 'completed'
    },
    { 
      id: 'HIST-002', 
      vehicle: 'AZ-006',
      service: 'Transmission Service',
      date: '2024-01-08',
      cost: 'R3,200',
      technician: 'Sarah Wilson',
      status: 'completed'
    },
    { 
      id: 'HIST-003', 
      vehicle: 'AZ-011',
      service: 'Brake System Replacement',
      date: '2024-01-05',
      cost: 'R2,800',
      technician: 'David Brown',
      status: 'completed'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            {/* Maintenance Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {maintenanceMetrics.map((metric, index) => (
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

            {/* Maintenance Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Upcoming Maintenance */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Upcoming Maintenance
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {scheduledMaintenance.slice(0, 4).map((maintenance) => (
                    <div key={maintenance.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: `1px solid ${
                        maintenance.status === 'overdue' ? 'var(--error)' : 
                        maintenance.priority === 'high' ? 'var(--warning)' : 'var(--success)'
                      }`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: maintenance.status === 'overdue' ? 'var(--error)' : 
                                     maintenance.priority === 'high' ? 'var(--warning)' : 'var(--success)'
                        }} />
                        <div>
                          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                            {maintenance.vehicle} - {maintenance.type}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Due: {maintenance.dueDate} • {maintenance.mileage}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                          {maintenance.estimatedCost}
                        </div>
                        <div style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '500',
                          background: maintenance.status === 'overdue' ? 'var(--error)' : 
                                     maintenance.status === 'in-progress' ? 'var(--warning)' : 'var(--success)',
                          color: 'white'
                        }}>
                          {maintenance.status.replace('-', ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Alerts */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Active Alerts
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {maintenanceAlerts.map((alert, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: `1px solid ${
                        alert.severity === 'high' ? 'var(--error)' : 
                        alert.severity === 'medium' ? 'var(--warning)' : 'var(--success)'
                      }`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <AlertTriangle size={16} style={{ 
                          color: alert.severity === 'high' ? 'var(--error)' : 
                                 alert.severity === 'medium' ? 'var(--warning)' : 'var(--success)'
                        }} />
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{alert.vehicle}</span>
                      </div>
                      <div style={{ fontSize: '14px', marginBottom: '8px' }}>{alert.alert}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {alert.time}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Action: {alert.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'scheduled':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Scheduled Maintenance
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {scheduledMaintenance.map((maintenance) => (
                  <div key={maintenance.id} style={{
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
                        background: maintenance.status === 'overdue' ? 'var(--error)' : 
                                   maintenance.status === 'in-progress' ? 'var(--warning)' : 'var(--success)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Wrench size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {maintenance.id} - {maintenance.type}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Vehicle: {maintenance.vehicle} • Due: {maintenance.dueDate}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          Mileage: {maintenance.mileage}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {maintenance.estimatedCost}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Est. Cost
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: maintenance.priority === 'high' ? 'var(--error)' : 
                                   maintenance.priority === 'medium' ? 'var(--warning)' : 'var(--success)',
                        color: 'white'
                      }}>
                        {maintenance.priority.toUpperCase()}
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
                Maintenance Alerts
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {maintenanceAlerts.map((alert, index) => (
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
                          {alert.vehicle} - {alert.alert}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Action Required: {alert.action}
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

      case 'history':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Maintenance History
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {maintenanceHistory.map((record) => (
                  <div key={record.id} style={{
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
                        background: 'var(--success)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircle size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {record.id} - {record.service}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Vehicle: {record.vehicle} • Technician: {record.technician}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          Completed: {record.date}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {record.cost}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Total Cost
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: 'var(--success)',
                        color: 'white'
                      }}>
                        COMPLETED
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
          Maintenance Service
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Comprehensive fleet maintenance management and scheduling
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

export default MaintenancePanel
