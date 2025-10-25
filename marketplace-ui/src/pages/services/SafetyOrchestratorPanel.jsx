import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ServicePanel from '../../components/ServicePanel'

const SafetyOrchestratorPanel = () => {
  const [safetyMetrics, setSafetyMetrics] = useState(null)
  const [activeAlerts, setActiveAlerts] = useState([])
  const [complianceStatus, setComplianceStatus] = useState([])
  const [riskAssessments, setRiskAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [runningAssessment, setRunningAssessment] = useState(false)

  useEffect(() => {
    fetchSafetyMetrics()
  }, [])

  const fetchSafetyMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to connect to azora-aegis safety endpoints
      const response = await axios.get('http://localhost:4099/api/aegis/safety/metrics')
      setSafetyMetrics(response.data)

      const alertsResponse = await axios.get('http://localhost:4099/api/aegis/alerts/active')
      setActiveAlerts(alertsResponse.data.alerts || [])

      const complianceResponse = await axios.get('http://localhost:4099/api/aegis/compliance/status')
      setComplianceStatus(complianceResponse.data.compliance || [])

      const riskResponse = await axios.get('http://localhost:4099/api/aegis/risk/assessments')
      setRiskAssessments(riskResponse.data.assessments || [])
    } catch (err) {
      console.error('Error fetching safety metrics:', err)
      setError('Aegis safety system unavailable. Using simulated data.')

      setSafetyMetrics({
        overallSafetyScore: 0.94,
        activeAlerts: 7,
        complianceRate: 0.98,
        riskLevel: 'low',
        incidentRate: 0.002,
        responseTime: 2.3
      })

      setActiveAlerts([
        { id: 'alert-1', type: 'system-anomaly', severity: 'medium', location: 'Data Center A', timestamp: '2024-01-20T09:15:00Z' },
        { id: 'alert-2', type: 'security-breach', severity: 'high', location: 'Network Gateway', timestamp: '2024-01-20T08:45:00Z' },
        { id: 'alert-3', type: 'compliance-violation', severity: 'low', location: 'User Access Control', timestamp: '2024-01-20T07:30:00Z' }
      ])

      setComplianceStatus([
        { category: 'Data Security', status: 'compliant', score: 0.96, lastAudit: '2024-01-15' },
        { category: 'Access Control', status: 'compliant', score: 0.98, lastAudit: '2024-01-18' },
        { category: 'Network Security', status: 'warning', score: 0.89, lastAudit: '2024-01-20' },
        { category: 'Regulatory Compliance', status: 'compliant', score: 0.97, lastAudit: '2024-01-12' }
      ])

      setRiskAssessments([
        { id: 'risk-1', category: 'Cybersecurity', level: 'medium', probability: 0.15, impact: 0.8, mitigation: 'active' },
        { id: 'risk-2', category: 'Operational', level: 'low', probability: 0.08, impact: 0.6, mitigation: 'planned' },
        { id: 'risk-3', category: 'Compliance', level: 'low', probability: 0.05, impact: 0.7, mitigation: 'implemented' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const runRiskAssessment = async () => {
    try {
      setRunningAssessment(true)
      setError(null)

      const response = await axios.post('http://localhost:4099/api/aegis/risk/assess', {
        assessmentType: 'comprehensive',
        scope: 'all-systems',
        priority: 'high'
      })

      if (response.data.success) {
        await fetchSafetyMetrics()
      }
    } catch (err) {
      console.error('Error running risk assessment:', err)
      setError('Failed to run risk assessment.')
    } finally {
      setRunningAssessment(false)
    }
  }

  const resolveAlert = async (alertId) => {
    try {
      const response = await axios.post(`http://localhost:4099/api/aegis/alerts/${alertId}/resolve`, {
        resolution: 'manual-intervention',
        notes: 'Resolved via safety orchestrator'
      })

      if (response.data.success) {
        await fetchSafetyMetrics()
      }
    } catch (err) {
      console.error('Error resolving alert:', err)
      setError('Failed to resolve alert.')
    }
  }

  const stats = safetyMetrics ? [
    { label: 'Safety Score', value: `${(safetyMetrics.overallSafetyScore * 100).toFixed(0)}%`, change: '+2%' },
    { label: 'Active Alerts', value: safetyMetrics.activeAlerts.toString(), change: '-1' },
    { label: 'Compliance Rate', value: `${(safetyMetrics.complianceRate * 100).toFixed(0)}%`, change: '+1%' },
    { label: 'Response Time', value: `${safetyMetrics.responseTime.toFixed(1)}min`, change: '-0.3min' }
  ] : []

  const actions = [
    { label: 'Refresh Status', onClick: fetchSafetyMetrics },
    { label: 'Run Assessment', onClick: runRiskAssessment, disabled: runningAssessment },
    { label: 'View Security Logs', onClick: () => console.log('View security logs') }
  ]

  if (loading) {
    return (
      <ServicePanel
        title="Safety Orchestrator"
        description="Comprehensive safety monitoring and compliance management"
        stats={stats}
        actions={actions}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </ServicePanel>
    )
  }

  return (
    <ServicePanel
      title="Safety Orchestrator"
      description="Comprehensive safety monitoring and compliance management"
      stats={stats}
      actions={actions}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Active Alerts */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Active Safety Alerts</h3>
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{alert.type.replace('-', ' ').toUpperCase()}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.severity}
                    </span>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{alert.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Status */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Compliance Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceStatus.map(compliance => (
              <div key={compliance.category} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{compliance.category}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    compliance.status === 'compliant' ? 'bg-green-100 text-green-800' :
                    compliance.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {compliance.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Compliance Score</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${compliance.score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm">Last Audit: {compliance.lastAudit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessments */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Risk Assessments</h3>
          <div className="space-y-3">
            {riskAssessments.map(risk => (
              <div key={risk.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{risk.category}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      risk.level === 'high' ? 'bg-red-100 text-red-800' :
                      risk.level === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {risk.level} risk
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      risk.mitigation === 'implemented' ? 'bg-green-100 text-green-800' :
                      risk.mitigation === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {risk.mitigation}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Probability</p>
                    <p className="text-lg font-semibold">{(risk.probability * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Impact</p>
                    <p className="text-lg font-semibold">{(risk.impact * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment Controls */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Risk Assessment Controls</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Assessment Type</label>
                <select className="w-full p-2 border border-border rounded">
                  <option>Comprehensive</option>
                  <option>Targeted</option>
                  <option>Continuous</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Scope</label>
                <select className="w-full p-2 border border-border rounded">
                  <option>All Systems</option>
                  <option>Critical Assets</option>
                  <option>Network Only</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={runRiskAssessment}
                  disabled={runningAssessment}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  {runningAssessment ? 'Running Assessment...' : 'Run Risk Assessment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ServicePanel>
  )
}

export default SafetyOrchestratorPanel