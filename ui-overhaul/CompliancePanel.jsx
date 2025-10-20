import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, CheckCircle, AlertTriangle, FileText,
  Settings, Calendar, Users, Eye, Download,
  Upload, Search, Filter, Plus, RefreshCw,
  TrendingUp, AlertCircle, CheckSquare, Clock,
  Database, Lock, UserCheck, FileCheck, Zap
} from 'lucide-react'

const CompliancePanel = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [complianceData, setComplianceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [frameworks, setFrameworks] = useState([])
  const [assessments, setAssessments] = useState([])
  const [documents, setDocuments] = useState([])
  const [dataRightsRequests, setDataRightsRequests] = useState([])
  const [breaches, setBreaches] = useState([])

  const COMPLIANCE_SERVICE_URL = 'http://localhost:3003'

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'frameworks', label: 'Frameworks', icon: Database },
    { id: 'assessments', label: 'Risk Assessment', icon: TrendingUp },
    { id: 'data-rights', label: 'Data Rights', icon: UserCheck },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'breaches', label: 'Breaches', icon: AlertTriangle },
    { id: 'audits', label: 'Audits', icon: CheckCircle },
    { id: 'reports', label: 'Reports', icon: FileCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  // Fetch data from compliance service
  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    try {
      setLoading(true)

      // Fetch frameworks
      const frameworksRes = await fetch(`${COMPLIANCE_SERVICE_URL}/api/frameworks`)
      const frameworksData = await frameworksRes.json()
      setFrameworks(Object.values(frameworksData.frameworks || {}))

      // Fetch health status for metrics
      const healthRes = await fetch(`${COMPLIANCE_SERVICE_URL}/health`)
      const healthData = await healthRes.json()

      setComplianceData({
        frameworksCount: healthData.frameworks || 0,
        aiModelsLoaded: healthData.aiModelsLoaded,
        mongodbConnected: healthData.mongodb,
        redisConnected: healthData.redis,
        uptime: healthData.uptime
      })

      // Mock additional data for demo
      setAssessments([
        {
          id: 'ASS-001',
          framework: 'GDPR',
          riskLevel: 'LOW',
          score: 15,
          lastAssessed: '2025-01-15',
          recommendations: ['Review data retention policies', 'Update consent forms']
        },
        {
          id: 'ASS-002',
          framework: 'HIPAA',
          riskLevel: 'MEDIUM',
          score: 45,
          lastAssessed: '2025-01-10',
          recommendations: ['Implement additional access controls', 'Conduct security training']
        }
      ])

      setDataRightsRequests([
        {
          id: 'DRR-001',
          right: 'ACCESS',
          subjectId: 'user-001',
          status: 'PENDING',
          submittedAt: '2025-01-12',
          sla: '2025-02-11'
        },
        {
          id: 'DRR-002',
          right: 'ERASURE',
          subjectId: 'user-002',
          status: 'COMPLETED',
          submittedAt: '2025-01-08',
          completedAt: '2025-01-15'
        }
      ])

      setBreaches([
        {
          id: 'BR-001',
          type: 'Unauthorized Access',
          affectedUsers: 1500,
          status: 'CONTAINED',
          reportedAt: '2025-01-10',
          notifications: ['GDPR', 'CCPA']
        }
      ])

    } catch (error) {
      console.error('Failed to fetch compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const complianceMetrics = [
    {
      label: 'Overall Compliance Score',
      value: '94.2%',
      change: '+2.1%',
      color: 'var(--success)',
      icon: Shield
    },
    {
      label: 'Active Frameworks',
      value: frameworks.length.toString(),
      change: '+1',
      color: 'var(--accent-primary)',
      icon: Database
    },
    {
      label: 'Data Rights Requests',
      value: dataRightsRequests.filter(r => r.status === 'PENDING').length.toString(),
      change: '-2',
      color: 'var(--warning)',
      icon: UserCheck
    },
    {
      label: 'Documents Expiring',
      value: '3',
      change: '+1',
      color: 'var(--error)',
      icon: Clock
    }
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
    if (loading) {
      return (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '16px' }} />
          <p>Loading compliance data...</p>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div>
            {/* Compliance Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {complianceMetrics.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <div key={index} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <Icon size={20} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {metric.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                      {metric.value}
                    </div>
                    <span style={{ color: metric.color, fontSize: '14px', fontWeight: '500' }}>
                      {metric.change}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* System Status & AI Models */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  System Status
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { component: 'AI Privacy Models', status: complianceData?.aiModelsLoaded ? 'operational' : 'initializing', icon: Zap },
                    { component: 'MongoDB Database', status: complianceData?.mongodbConnected ? 'connected' : 'disconnected', icon: Database },
                    { component: 'Redis Cache', status: complianceData?.redisConnected ? 'connected' : 'disconnected', icon: Database },
                    { component: 'Compliance Engine', status: 'operational', icon: Shield }
                  ].map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Icon size={16} style={{ color: 'var(--accent-primary)' }} />
                          <span style={{ fontWeight: '500' }}>{item.component}</span>
                        </div>
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: item.status === 'operational' || item.status === 'connected' ? 'var(--success)' : 'var(--warning)',
                          color: 'white'
                        }}>
                          {item.status}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Recent Activity
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { action: 'Risk assessment completed', time: '2 hours ago', type: 'success' },
                    { action: 'Data rights request received', time: '4 hours ago', type: 'info' },
                    { action: 'Document expiring soon', time: '1 day ago', type: 'warning' },
                    { action: 'Framework compliance updated', time: '2 days ago', type: 'success' }
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

      case 'frameworks':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Compliance Frameworks</h3>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} />
                Add Framework
              </button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {frameworks.map((framework, index) => (
                <div key={index} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        {framework.name}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Region: {framework.region}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {framework.requirements.map((req, reqIndex) => (
                          <span key={reqIndex} style={{
                            padding: '4px 8px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: 'var(--text-secondary)'
                          }}>
                            {req.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--error)', marginBottom: '4px' }}>
                        Up to {framework.penalties.max.toLocaleString()} {framework.penalties.currency}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Max Penalty
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary">View Details</button>
                    <button className="btn-secondary">Run Assessment</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'assessments':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Risk Assessments</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" onClick={fetchComplianceData}>
                  <RefreshCw size={16} />
                </button>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={16} />
                  New Assessment
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {assessments.map((assessment) => (
                <div key={assessment.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {assessment.id} - {assessment.framework}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                        Last assessed: {assessment.lastAssessed}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: assessment.riskLevel === 'HIGH' ? 'var(--error)' :
                                     assessment.riskLevel === 'MEDIUM' ? 'var(--warning)' : 'var(--success)',
                          color: 'white'
                        }}>
                          {assessment.riskLevel} RISK
                        </span>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                          Score: {assessment.score}/100
                        </span>
                      </div>
                    </div>
                    <div style={{ width: '120px', height: '120px' }}>
                      {/* Risk Score Circular Progress */}
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle
                          cx="60" cy="60" r="50"
                          fill="none"
                          stroke="var(--bg-tertiary)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="60" cy="60" r="50"
                          fill="none"
                          stroke={assessment.riskLevel === 'HIGH' ? 'var(--error)' :
                                  assessment.riskLevel === 'MEDIUM' ? 'var(--warning)' : 'var(--success)'}
                          strokeWidth="8"
                          strokeDasharray={`${(assessment.score / 100) * 314} 314`}
                          strokeDashoffset="0"
                          transform="rotate(-90 60 60)"
                          strokeLinecap="round"
                        />
                        <text x="60" y="65" textAnchor="middle" fontSize="18" fontWeight="700">
                          {assessment.score}
                        </text>
                      </svg>
                    </div>
                  </div>
                  {assessment.recommendations.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        Recommendations:
                      </h5>
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {assessment.recommendations.map((rec, index) => (
                          <li key={index} style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary">View Details</button>
                    <button className="btn-secondary">Re-run Assessment</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'data-rights':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Data Subject Rights Requests</h3>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} />
                New Request
              </button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {dataRightsRequests.map((request) => (
                <div key={request.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {request.id} - {request.right}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Subject: {request.subjectId} • Submitted: {request.submittedAt}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: request.status === 'COMPLETED' ? 'var(--success)' :
                                   request.status === 'PENDING' ? 'var(--warning)' : 'var(--accent-primary)',
                        color: 'white',
                        marginBottom: '8px'
                      }}>
                        {request.status}
                      </div>
                      {request.sla && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          SLA: {request.sla}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary">View Details</button>
                    {request.status === 'PENDING' && (
                      <button className="btn-primary">Process Request</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'breaches':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Data Breach Reports</h3>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} />
                Report Breach
              </button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {breaches.map((breach) => (
                <div key={breach.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {breach.id} - {breach.type}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                        Reported: {breach.reportedAt} • Affected: {breach.affectedUsers.toLocaleString()} users
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {breach.notifications.map((framework, index) => (
                          <span key={index} style={{
                            padding: '4px 8px',
                            background: 'var(--error)',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {framework} Notice Required
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: breach.status === 'CONTAINED' ? 'var(--success)' : 'var(--warning)',
                      color: 'white'
                    }}>
                      {breach.status}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary">View Details</button>
                    <button className="btn-secondary">Download Report</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'documents':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Compliance Documents</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={16} />
                  Upload
                </button>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} />
                  Export All
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { name: 'GDPR Compliance Report', status: 'valid', expires: '2025-12-31', type: 'Report', framework: 'GDPR' },
                { name: 'HIPAA Security Assessment', status: 'valid', expires: '2025-06-30', type: 'Assessment', framework: 'HIPAA' },
                { name: 'CCPA Privacy Notice', status: 'expiring', expires: '2025-02-15', type: 'Policy', framework: 'CCPA' },
                { name: 'Data Processing Agreement', status: 'valid', expires: '2025-09-30', type: 'Contract', framework: 'GDPR' },
                { name: 'Breach Response Plan', status: 'valid', expires: '2025-08-31', type: 'Plan', framework: 'General' }
              ].map((doc, index) => (
                <div key={index} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{doc.name}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                          {doc.type} • {doc.framework} • Expires: {doc.expires}
                        </p>
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: doc.status === 'valid' ? 'var(--success)' :
                                     doc.status === 'expiring' ? 'var(--warning)' : 'var(--error)',
                          color: 'white',
                          display: 'inline-block'
                        }}>
                          {doc.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="btn-secondary">
                        <Eye size={16} />
                      </button>
                      <button className="btn-secondary">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'reports':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Compliance Reports</h3>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} />
                Generate Report
              </button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { id: 'RPT-001', name: 'Q4 2024 Compliance Report', type: 'Quarterly', frameworks: ['GDPR', 'HIPAA'], generated: '2025-01-15', status: 'completed' },
                { id: 'RPT-002', name: 'Annual Privacy Assessment', type: 'Annual', frameworks: ['GDPR', 'CCPA'], generated: '2025-01-01', status: 'completed' },
                { id: 'RPT-003', name: 'Monthly Risk Summary', type: 'Monthly', frameworks: ['All'], generated: '2025-01-20', status: 'processing' }
              ].map((report) => (
                <div key={report.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{report.name}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                        {report.type} • Generated: {report.generated}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {report.frameworks.map((framework, index) => (
                          <span key={index} style={{
                            padding: '2px 6px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: 'var(--text-secondary)'
                          }}>
                            {framework}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: report.status === 'completed' ? 'var(--success)' : 'var(--warning)',
                        color: 'white'
                      }}>
                        {report.status}
                      </div>
                      <button className="btn-secondary">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <Settings size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Advanced compliance settings and configuration
            </p>
          </div>
        )
    }
  }
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
