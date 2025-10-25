import React from 'react'
import ServicePanel from '../components/ServicePanel'

const GenericServicePanel = ({ title, description, serviceType }) => {
  const stats = [
    { label: 'Active Instances', value: '247', change: '+12%' },
    { label: 'Performance', value: '98%', change: '+2%' },
    { label: 'Uptime', value: '99.9%', change: '+0.1%' },
    { label: 'Requests/min', value: '1,247', change: '+8%' }
  ]

  const actions = [
    { label: 'Configure', onClick: () => console.log(`Configure ${serviceType}`) },
    { label: 'Monitor', onClick: () => console.log(`Monitor ${serviceType}`) }
  ]

  return (
    <ServicePanel
      title={title}
      description={description}
      stats={stats}
      actions={actions}
    >
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{serviceType} Service</h3>
        <p className="text-muted-foreground mb-6">
          This service panel is currently under development. Full functionality will be available soon.
        </p>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">✓</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">24/7</div>
            <div className="text-sm text-muted-foreground">Monitoring</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">AI</div>
            <div className="text-sm text-muted-foreground">Powered</div>
          </div>
        </div>
      </div>
    </ServicePanel>
  )
}

export default GenericServicePanel