import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, TrendingUp, PieChart, Activity, 
  Settings, Download, Filter, Calendar 
} from 'lucide-react'

const AnalyticsPanel = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('7d')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'operations', label: 'Operations', icon: Activity },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const analyticsMetrics = [
    { label: 'Total Revenue', value: 'R2.4M', change: '+18.2%', color: 'var(--success)' },
    { label: 'Active Orders', value: '1,847', change: '+12.5%', color: 'var(--accent-primary)' },
    { label: 'Fleet Utilization', value: '87.3%', change: '+5.1%', color: 'var(--success)' },
    { label: 'Customer Satisfaction', value: '4.8/5', change: '+0.2', color: 'var(--success)' }
  ]

  const performanceData = [
    { metric: 'Delivery Time', current: '2.4h', target: '2.5h', performance: 96, trend: 'up' },
    { metric: 'Fuel Efficiency', current: '8.2L/100km', target: '8.5L/100km', performance: 104, trend: 'up' },
    { metric: 'Route Optimization', current: '94.2%', target: '90%', performance: 105, trend: 'up' },
    { metric: 'Vehicle Uptime', current: '98.7%', target: '95%', performance: 104, trend: 'up' },
    { metric: 'Cost per Delivery', current: 'R45.20', target: 'R50.00', performance: 110, trend: 'up' },
    { metric: 'Customer Rating', current: '4.8/5', target: '4.5/5', performance: 107, trend: 'up' }
  ]

  const recentReports = [
    { name: 'Monthly Fleet Performance', type: 'PDF', size: '2.4 MB', date: '2 hours ago' },
    { name: 'Weekly Operations Summary', type: 'Excel', size: '1.8 MB', date: '1 day ago' },
    { name: 'Customer Satisfaction Analysis', type: 'PDF', size: '3.2 MB', date: '2 days ago' },
    { name: 'Route Optimization Report', type: 'PDF', size: '1.5 MB', date: '3 days ago' },
    { name: 'Financial Performance Q4', type: 'Excel', size: '4.1 MB', date: '1 week ago' }
  ]

  const operationalInsights = [
    { 
      category: 'Peak Hours',
      insight: 'Highest activity between 9-11 AM and 2-4 PM',
      impact: 'High',
      recommendation: 'Optimize driver schedules for peak periods'
    },
    { 
      category: 'Route Efficiency',
      insight: 'N1 Highway routes show 15% better efficiency',
      impact: 'Medium',
      recommendation: 'Prioritize highway routes when possible'
    },
    { 
      category: 'Vehicle Performance',
      insight: 'Electric vehicles outperform diesel by 23%',
      impact: 'High',
      recommendation: 'Accelerate EV fleet transition'
    },
    { 
      category: 'Customer Behavior',
      insight: 'Same-day delivery requests increased 34%',
      impact: 'Medium',
      recommendation: 'Expand same-day delivery capacity'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            {/* Date Range Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Analytics Overview</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="input"
                  style={{ width: 'auto', minWidth: '120px' }}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <button className="btn-secondary">
                  <Filter size={16} />
                  Filter
                </button>
                <button className="btn-secondary">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            {/* Analytics Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {analyticsMetrics.map((metric, index) => (
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

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
              {/* Revenue Chart */}
              <div className="card" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                  Revenue Trends
                </h4>
                <div style={{
                  height: '250px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <TrendingUp size={48} style={{ color: 'var(--accent-primary)', opacity: 0.3 }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>Jan</span>
                      <span>Mar</span>
                      <span>May</span>
                      <span>Jul</span>
                      <span>Sep</span>
                      <span>Nov</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Breakdown */}
              <div className="card" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                  Performance Breakdown
                </h4>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { label: 'On-Time Delivery', value: '94.2%', color: 'var(--success)' },
                    { label: 'Route Efficiency', value: '87.8%', color: 'var(--accent-primary)' },
                    { label: 'Fuel Savings', value: '12.4%', color: 'var(--success)' },
                    { label: 'Customer Rating', value: '4.8/5', color: 'var(--success)' }
                  ].map((item, index) => (
                    <div key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{item.label}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: item.color }}>{item.value}</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${parseFloat(item.value)}%`,
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

            {/* Operational Insights */}
            <div className="card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                Key Operational Insights
              </h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                {operationalInsights.slice(0, 3).map((insight, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: `1px solid ${
                      insight.impact === 'High' ? 'var(--error)' : 
                      insight.impact === 'Medium' ? 'var(--warning)' : 'var(--success)'
                    }`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600' }}>{insight.category}</span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '500',
                        background: insight.impact === 'High' ? 'var(--error)' : 
                                   insight.impact === 'Medium' ? 'var(--warning)' : 'var(--success)',
                        color: 'white'
                      }}>
                        {insight.impact} Impact
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                      {insight.insight}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      Recommendation: {insight.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'performance':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Performance Metrics
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {performanceData.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.metric}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Target: {item.target}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                          {item.current}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Current
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '600',
                          color: item.performance >= 100 ? 'var(--success)' : 'var(--warning)'
                        }}>
                          {item.performance}%
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          Performance
                        </div>
                      </div>
                      
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: item.trend === 'up' ? 'var(--success)' : 'var(--error)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <TrendingUp size={12} style={{ color: 'white' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'reports':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Generated Reports</h3>
              <button className="btn-primary">
                <PieChart size={16} />
                Generate Report
              </button>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {recentReports.map((report, index) => (
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
                        background: report.type === 'PDF' ? 'var(--error)' : 'var(--success)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PieChart size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{report.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {report.type} • {report.size} • {report.date}
                        </div>
                      </div>
                    </div>
                    
                    <button className="btn-secondary">
                      <Download size={16} />
                      Download
                    </button>
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
          Analytics Service
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Comprehensive analytics and business intelligence
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

export default AnalyticsPanel
