import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Button } from './ui/button'
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Users,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface SystemMetric {
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  threshold: {
    warning: number
    critical: number
  }
}

interface ServiceStatus {
  name: string
  status: 'online' | 'degraded' | 'offline'
  uptime: string
  responseTime: number
  lastIncident?: Date
}

export default function SystemPulse() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU Usage',
      value: 45.2,
      unit: '%',
      status: 'healthy',
      trend: 'stable',
      threshold: { warning: 70, critical: 90 }
    },
    {
      name: 'Memory Usage',
      value: 62.8,
      unit: '%',
      status: 'healthy',
      trend: 'up',
      threshold: { warning: 75, critical: 90 }
    },
    {
      name: 'Storage Usage',
      value: 34.1,
      unit: '%',
      status: 'healthy',
      trend: 'stable',
      threshold: { warning: 80, critical: 95 }
    },
    {
      name: 'Network I/O',
      value: 28.7,
      unit: 'Mbps',
      status: 'healthy',
      trend: 'down',
      threshold: { warning: 50, critical: 80 }
    },
    {
      name: 'Active Users',
      value: 2847,
      unit: '',
      status: 'healthy',
      trend: 'up',
      threshold: { warning: 3000, critical: 3500 }
    },
    {
      name: 'API Response Time',
      value: 145,
      unit: 'ms',
      status: 'healthy',
      trend: 'stable',
      threshold: { warning: 300, critical: 500 }
    }
  ])

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'AZR Mint',
      status: 'online',
      uptime: '99.9%',
      responseTime: 89
    },
    {
      name: 'Learn Platform',
      status: 'online',
      uptime: '99.8%',
      responseTime: 124
    },
    {
      name: 'Compliance Engine',
      status: 'online',
      uptime: '99.9%',
      responseTime: 156
    },
    {
      name: 'Forge Marketplace',
      status: 'degraded',
      uptime: '98.5%',
      responseTime: 234,
      lastIncident: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      name: 'Enterprise Portal',
      status: 'online',
      uptime: '99.7%',
      responseTime: 198
    },
    {
      name: 'Developer API',
      status: 'online',
      uptime: '99.9%',
      responseTime: 67
    }
  ])

  const [overallHealth, setOverallHealth] = useState(96.4)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        let newValue = metric.value + (Math.random() - 0.5) * 5
        newValue = Math.max(0, Math.min(metric.name.includes('Usage') || metric.name.includes('I/O') ? 100 : 5000, newValue))

        let status: 'healthy' | 'warning' | 'critical' = 'healthy'
        if (newValue >= metric.threshold.critical) status = 'critical'
        else if (newValue >= metric.threshold.warning) status = 'warning'

        const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable']
        const trend = trends[Math.floor(Math.random() * trends.length)]

        return { ...metric, value: newValue, status, trend }
      }))

      setOverallHealth(prev => Math.max(85, Math.min(100, prev + (Math.random() - 0.5) * 2)))
      setLastUpdate(new Date())
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      case 'online': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'offline': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10'
      case 'warning': return 'bg-yellow-500/10'
      case 'critical': return 'bg-red-500/10'
      case 'online': return 'bg-green-500/10'
      case 'degraded': return 'bg-yellow-500/10'
      case 'offline': return 'bg-red-500/10'
      default: return 'bg-gray-500/10'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />
      default: return <Minus className="h-3 w-3 text-gray-500" />
    }
  }

  const getServiceIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'offline': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary animate-pulse" />
            System Pulse
          </h3>
          <p className="text-muted-foreground">
            Real-time system health and performance monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${overallHealth > 95 ? 'bg-green-500' : overallHealth > 90 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm font-medium">{overallHealth.toFixed(1)}% Healthy</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Updated {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, i) => (
          <Card key={i} className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(metric.status)}`} />
                  <span className="font-medium text-sm">{metric.name}</span>
                </div>
                {getTrendIcon(metric.trend)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metric.name.includes('Users') ? Math.round(metric.value).toLocaleString() : metric.value.toFixed(1)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>
                  </span>
                  <Badge variant="outline" className={`text-xs ${getStatusBg(metric.status)}`}>
                    {metric.status}
                  </Badge>
                </div>

                {metric.name.includes('Usage') && (
                  <Progress
                    value={metric.value}
                    className="h-2"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Status */}
      <Card className="border-0 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Service Status
          </CardTitle>
          <CardDescription>
            Current status of all Azora OS services and platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  {getServiceIcon(service.status)}
                  <div>
                    <h4 className="font-medium text-sm">{service.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Uptime: {service.uptime}</span>
                      <span>•</span>
                      <span>{service.responseTime}ms</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getStatusBg(service.status)}`}>
                    {service.status}
                  </Badge>
                  {service.lastIncident && (
                    <div className="text-xs text-muted-foreground">
                      Incident {Math.floor((Date.now() - service.lastIncident.getTime()) / (1000 * 60 * 60))}h ago
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border/50">
            <Button variant="outline" className="w-full">
              View Detailed Status Page
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="justify-start">
              <HardDrive className="h-4 w-4 mr-2" />
              Scale Resources
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Incident Response
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance Report
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              User Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}