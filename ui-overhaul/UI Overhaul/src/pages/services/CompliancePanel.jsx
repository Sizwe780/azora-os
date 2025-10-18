import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, CheckCircle, AlertTriangle, FileText, 
  Settings, Calendar, Users, Eye 
} from 'lucide-react'

const CompliancePanel = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'audits', label: 'Audits', icon: CheckCircle },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'training', label: 'Training', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const complianceMetrics = [
    { label: 'Compliance Score', value: '98.7%', change: '+1.2%', color: 'var(--success)' },
    { label: 'Active Audits', value: '3', change: '+1', color: 'var(--warning)' },
    { label: 'Violations (30d)', value: '2', change: '-5', color: 'var(--success)' },
    { label: 'Cert. Expiring', value: '7', change: '+2', color: 'var(--warning)' }
  ]

  const activeAudits = [
    { 
      id: 'AUD-001', 
      type: 'Safety Compliance',
      auditor: 'SABS Certification',
      status: 'in-progress',
      startDate: '2024-01-15',
      dueDate: '2024-01-30',
      progress: 65
    },
    { 
      id: 'AUD-002', 
      type: 'Environmental Standards',
      auditor: 'Green Transport SA',
      status: 'scheduled',
      startDate: '2024-02-01',
      dueDate: '2024-02-15',
      progress: 0
    },
    { 
      id: 'AUD-003', 
      type: 'Driver Certification',
      auditor: 'Transport Authority',
      status: 'completed',
      startDate: '2024-01-01',
      dueDate: '2024-01-10',
      progress: 100
    }
  ]

  const recentViolations = [
    { 
      id: 'VIO-001', 
      type: 'Speed Limit Exceeded',
      severity: 'medium',
      vehicle: 'AZ-001',
      driver: 'John Smith',
      date: '2024-01-20',
      status: 'resolved',
      fine: 'R500'
    },
    { 
      id: 'VIO-002', 
      type: 'Overweight Load',
      severity: 'high',
      vehicle: 'AZ-007',
      driver: 'Mike Wilson',
      date: '2024-01-18',
      status: 'pending',
      fine: 'R2,500'
    },
    { 
      id: 'VIO-003', 
      type: 'Documentation Missing',
      severity: 'low',
      vehicle: 'AZ-003',
      driver: 'Sarah Johnson',
      date: '2024-01-15',
      status: 'resolved',
      fine: 'R200'
    }
  ]

  const complianceDocuments = [
    { name: 'Operating License', status: 'valid', expires: '2024-12-31', type: 'License' },
    { name: 'Insurance Certificate', status: 'valid', expires: '2024-06-30', type: 'Insurance' },
    { name: 'Safety Certification', status: 'expiring', expires: '2024-02-15', type: 'Certificate' },
    { name: 'Environmental Permit', status: 'valid', expires: '2024-09-30', type: 'Permit' },
    { name: 'Driver Training Records', status: 'valid', expires: '2024-08-31', type: 'Training' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            {/* Compliance Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {complianceMetrics.map((metric, index) => (
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

            {/* Compliance Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Compliance Status */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Compliance Status Overview
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { category: 'Safety Standards', score: 99, status: 'excellent' },
                    { category: 'Environmental', score: 95, status: 'good' },
                    { category: 'Driver Compliance', score: 98, status: 'excellent' },
                    { category: 'Vehicle Standards', score: 97, status: 'excellent' },
                    { category: 'Documentation', score: 92, status: 'good' }
                  ].map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', marginBottom: '8px' }}>{item.category}</div>
                        <div style={{
                          width: '100%',
                          height: '6px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${item.score}%`,
                            height: '100%',
                            background: item.score >= 95 ? 'var(--success)' : 
                                       item.score >= 85 ? 'var(--warning)' : 'var(--error)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                      <div style={{ marginLeft: '16px', textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>{item.score}%</div>
                        <div style={{ 
                          fontSize: '12px',
                          color: item.score >= 95 ? 'var(--success)' : 
                                 item.score >= 85 ? 'var(--warning)' : 'var(--error)'
                        }}>
                          {item.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Recent Activity
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { action: 'Safety audit completed', time: '2 hours ago', type: 'success' },
                    { action: 'Driver training scheduled', time: '4 hours ago', type: 'info' },
                    { action: 'Certificate renewal due', time: '1 day ago', type: 'warning' },
                    { action: 'Violation reported', time: '2 days ago', type: 'error' }
                  ].map((activity, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: activity.type === 'success' ? 'var(--success)' : 
                                   activity.type === 'warning' ? 'var(--warning)' : 
                                   activity.type === 'error' ? 'var(--error)' : 'var(--accent-primary)'
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', marginBottom: '2px' }}>{activity.action}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'audits':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Compliance Audits
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {activeAudits.map((audit) => (
                  <div key={audit.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: `1px solid ${
                      audit.status === 'completed' ? 'var(--success)' : 
                      audit.status === 'in-progress' ? 'var(--warning)' : 'var(--accent-primary)'
                    }`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: audit.status === 'completed' ? 'var(--success)' : 
                                   audit.status === 'in-progress' ? 'var(--warning)' : 'var(--accent-primary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircle size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {audit.id} - {audit.type}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Auditor: {audit.auditor}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          {audit.startDate} - {audit.dueDate}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {audit.progress}%
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Progress
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: audit.status === 'completed' ? 'var(--success)' : 
                                   audit.status === 'in-progress' ? 'var(--warning)' : 'var(--accent-primary)',
                        color: 'white'
                      }}>
                        {audit.status.replace('-', ' ').toUpperCase()}
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

      case 'violations':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Compliance Violations
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {recentViolations.map((violation) => (
                  <div key={violation.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: `1px solid ${
                      violation.severity === 'high' ? 'var(--error)' : 
                      violation.severity === 'medium' ? 'var(--warning)' : 'var(--success)'
                    }`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: violation.severity === 'high' ? 'var(--error)' : 
                                   violation.severity === 'medium' ? 'var(--warning)' : 'var(--success)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <AlertTriangle size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {violation.id} - {violation.type}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {violation.driver} • {violation.vehicle} • {violation.date}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                          {violation.fine}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Fine
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: violation.status === 'resolved' ? 'var(--success)' : 'var(--warning)',
                        color: 'white'
                      }}>
                        {violation.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'documents':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Compliance Documents
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {complianceDocuments.map((doc, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: `1px solid ${
                      doc.status === 'valid' ? 'var(--success)' : 
                      doc.status === 'expiring' ? 'var(--warning)' : 'var(--error)'
                    }`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: doc.status === 'valid' ? 'var(--success)' : 
                                   doc.status === 'expiring' ? 'var(--warning)' : 'var(--error)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FileText size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{doc.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {doc.type} • Expires: {doc.expires}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: doc.status === 'valid' ? 'var(--success)' : 
                                   doc.status === 'expiring' ? 'var(--warning)' : 'var(--error)',
                        color: 'white'
                      }}>
                        {doc.status.toUpperCase()}
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
          Compliance Engine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Comprehensive compliance monitoring and management
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

export default CompliancePanel
