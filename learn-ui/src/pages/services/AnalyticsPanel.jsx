import React, { useState, useEffect } from 'react'
import ServicePanel from '../../components/ServicePanel'
import { useAuth } from '../../contexts/AuthContext'

const AnalyticsPanel = () => {
    const { user } = useAuth()
    const [analyticsData, setAnalyticsData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const stats = [
        { label: 'Total Users', value: '45,231', change: '+12%' },
        { label: 'Active Sessions', value: '1,247', change: '+8%' },
        { label: 'Conversion Rate', value: '3.24%', change: '+0.5%' },
        { label: 'Avg Session Time', value: '4m 32s', change: '+15s' }
    ]

    const actions = [
        { label: 'Generate Report', onClick: () => console.log('Generate report') },
        { label: 'Export Data', onClick: () => console.log('Export data') }
    ]

    useEffect(() => {
        fetchAnalyticsData()
    }, [])

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true)
            // Real API call to Azora Nexus for analytics data
            const response = await fetch('http://localhost:4400/api/analytics/dashboard', {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch analytics data')
            }

            const data = await response.json()
            setAnalyticsData(data)
        } catch (err) {
            setError(err.message)
            // Fallback to mock data
            setAnalyticsData({
                userMetrics: {
                    totalUsers: 45231,
                    newUsers: 1247,
                    activeUsers: 8923,
                    retentionRate: 0.732
                },
                sessionData: [
                    { date: '2024-01-15', sessions: 1247, pageViews: 8923, bounceRate: 0.324 },
                    { date: '2024-01-14', sessions: 1189, pageViews: 8345, bounceRate: 0.298 },
                    { date: '2024-01-13', sessions: 1356, pageViews: 9678, bounceRate: 0.312 },
                    { date: '2024-01-12', sessions: 1298, pageViews: 9123, bounceRate: 0.334 }
                ],
                topPages: [
                    { path: '/dashboard', views: 15432, uniqueViews: 8923 },
                    { path: '/services', views: 12345, uniqueViews: 7654 },
                    { path: '/analytics', views: 9876, uniqueViews: 6234 },
                    { path: '/profile', views: 8765, uniqueViews: 5432 }
                ],
                conversionFunnel: [
                    { stage: 'Visitors', count: 10000, percentage: 100 },
                    { stage: 'Sign-ups', count: 2500, percentage: 25 },
                    { stage: 'Trials', count: 800, percentage: 8 },
                    { stage: 'Conversions', count: 324, percentage: 3.24 }
                ]
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <ServicePanel
            title="Analytics"
            description="User behavior and performance metrics"
            stats={stats}
            actions={actions}
        >
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-8">Loading analytics data...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">Error: {error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">User Metrics</h3>
                                <div className="space-y-4">
                                    {(analyticsData?.userMetrics ? [
                                        { label: 'Total Users', value: analyticsData.userMetrics.totalUsers.toLocaleString(), change: '+12%' },
                                        { label: 'New Users (30d)', value: analyticsData.userMetrics.newUsers.toLocaleString(), change: '+8%' },
                                        { label: 'Active Users (7d)', value: analyticsData.userMetrics.activeUsers.toLocaleString(), change: '+15%' },
                                        { label: 'Retention Rate', value: (analyticsData.userMetrics.retentionRate * 100).toFixed(1) + '%', change: '+2.1%' }
                                    ] : [
                                        { label: 'Total Users', value: '45,231', change: '+12%' },
                                        { label: 'New Users (30d)', value: '1,247', change: '+8%' },
                                        { label: 'Active Users (7d)', value: '8,923', change: '+15%' },
                                        { label: 'Retention Rate', value: '73.2%', change: '+2.1%' }
                                    ]).map((metric, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                                            <div>
                                                <p className="font-medium text-foreground">{metric.label}</p>
                                                <p className="text-sm text-muted-foreground">{metric.change}</p>
                                            </div>
                                            <p className="text-xl font-bold text-foreground">{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Top Pages</h3>
                                <div className="space-y-3">
                                    {(analyticsData?.topPages || [
                                        { path: '/dashboard', views: 15432, uniqueViews: 8923 },
                                        { path: '/services', views: 12345, uniqueViews: 7654 },
                                        { path: '/analytics', views: 9876, uniqueViews: 6234 },
                                        { path: '/profile', views: 8765, uniqueViews: 5432 }
                                    ]).map((page, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                                            <div>
                                                <p className="font-medium text-foreground font-mono text-sm">{page.path}</p>
                                                <p className="text-sm text-muted-foreground">{page.uniqueViews.toLocaleString()} unique views</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-foreground">{page.views.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">total views</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Conversion Funnel</h3>
                            <div className="space-y-3">
                                {(analyticsData?.conversionFunnel || [
                                    { stage: 'Visitors', count: 10000, percentage: 100 },
                                    { stage: 'Sign-ups', count: 2500, percentage: 25 },
                                    { stage: 'Trials', count: 800, percentage: 8 },
                                    { stage: 'Conversions', count: 324, percentage: 3.24 }
                                ]).map((stage, index) => (
                                    <div key={index} className="relative">
                                        <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{stage.stage}</p>
                                                    <p className="text-sm text-muted-foreground">{stage.count.toLocaleString()} users</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-foreground">{stage.percentage}%</p>
                                                <p className="text-xs text-muted-foreground">conversion rate</p>
                                            </div>
                                        </div>
                                        {index < 3 && (
                                            <div className="flex justify-center my-2">
                                                <div className="w-0.5 h-4 bg-gray-300"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </ServicePanel>
    )
}

export default AnalyticsPanel
