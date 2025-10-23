import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import {
  Brain,
  Shield,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Heart,
  Scale,
  Crown
} from 'lucide-react'

interface ConstitutionalMetric {
  name: string
  value: number
  status: 'optimal' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  description: string
}

interface GovernanceAction {
  id: string
  type: 'policy' | 'enforcement' | 'adaptation'
  title: string
  description: string
  timestamp: Date
  status: 'active' | 'completed' | 'pending'
  impact: 'high' | 'medium' | 'low'
}

export default function ConstitutionalGovernor() {
  const [metrics, setMetrics] = useState<ConstitutionalMetric[]>([
    {
      name: 'System Integrity',
      value: 98.5,
      status: 'optimal',
      trend: 'up',
      description: 'Overall system compliance and integrity score'
    },
    {
      name: 'User Trust',
      value: 94.2,
      status: 'optimal',
      trend: 'stable',
      description: 'Community trust and satisfaction metrics'
    },
    {
      name: 'Regulatory Compliance',
      value: 96.8,
      status: 'optimal',
      trend: 'up',
      description: 'Adherence to legal and regulatory frameworks'
    },
    {
      name: 'Resource Equity',
      value: 87.3,
      status: 'warning',
      trend: 'up',
      description: 'Fair distribution of platform resources'
    },
    {
      name: 'Innovation Balance',
      value: 91.7,
      status: 'optimal',
      trend: 'stable',
      description: 'Balance between stability and innovation'
    },
    {
      name: 'Community Health',
      value: 89.4,
      status: 'warning',
      trend: 'down',
      description: 'Overall community well-being and engagement'
    }
  ])

  const [recentActions, setRecentActions] = useState<GovernanceAction[]>([
    {
      id: '1',
      type: 'policy',
      title: 'Enhanced Privacy Protection',
      description: 'Implemented advanced privacy controls for user data',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'completed',
      impact: 'high'
    },
    {
      id: '2',
      type: 'enforcement',
      title: 'Resource Allocation Adjustment',
      description: 'Rebalanced AZR token distribution to improve equity',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: 'active',
      impact: 'medium'
    },
    {
      id: '3',
      type: 'adaptation',
      title: 'New Feature Governance',
      description: 'Reviewing community proposals for new platform features',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      status: 'pending',
      impact: 'medium'
    }
  ])

  const [systemPulse, setSystemPulse] = useState(72) // BPM-like system health indicator

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 2))
      })))
      setSystemPulse(prev => Math.max(60, Math.min(90, prev + (Math.random() - 0.5) * 5)))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500/10'
      case 'warning': return 'bg-yellow-500/10'
      case 'critical': return 'bg-red-500/10'
      default: return 'bg-gray-500/10'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'policy': return <Shield className="h-4 w-4" />
      case 'enforcement': return <Scale className="h-4 w-4" />
      case 'adaptation': return <Brain className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            Constitutional Governor
          </h3>
          <p className="text-muted-foreground">
            AI-powered governance ensuring platform integrity and community well-being
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className={`h-4 w-4 ${systemPulse > 75 ? 'text-green-500' : systemPulse > 65 ? 'text-yellow-500' : 'text-red-500'} animate-pulse`} />
            <span className="text-sm font-medium">{Math.round(systemPulse)} BPM</span>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      {/* Constitutional Metrics Grid */}
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
                  <span className="text-2xl font-bold">{metric.value.toFixed(1)}%</span>
                  <Badge variant="outline" className={`text-xs ${getStatusBg(metric.status)}`}>
                    {metric.status}
                  </Badge>
                </div>
                <Progress value={metric.value} className="h-2" />
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Governance Actions */}
      <Card className="border-0 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Governance Actions
          </CardTitle>
          <CardDescription>
            Latest constitutional governance decisions and implementations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActions.map((action) => (
              <div key={action.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className={`p-2 rounded-lg ${action.type === 'policy' ? 'bg-blue-500/10' : action.type === 'enforcement' ? 'bg-purple-500/10' : 'bg-green-500/10'}`}>
                  {getActionIcon(action.type)}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{action.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={action.status === 'completed' ? 'default' : action.status === 'active' ? 'secondary' : 'outline'} className="text-xs">
                        {action.status}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${action.impact === 'high' ? 'border-red-500 text-red-500' : action.impact === 'medium' ? 'border-yellow-500 text-yellow-500' : 'border-green-500 text-green-500'}`}>
                        {action.impact} impact
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{action.description}</p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {action.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border/50">
            <Button variant="outline" className="w-full">
              View Full Governance Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Constitutional Principles Display */}
      <Card className="border-0 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Core Constitutional Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { principle: 'User Sovereignty', description: 'Users maintain control over their data and digital identity' },
              { principle: 'Fair Resource Distribution', description: 'Equitable access to platform resources and opportunities' },
              { principle: 'Transparency & Accountability', description: 'Clear governance processes and decision-making' },
              { principle: 'Innovation with Stability', description: 'Balanced approach to technological advancement' },
              { principle: 'Community Governance', description: 'Participatory decision-making and feedback loops' },
              { principle: 'Regulatory Compliance', description: 'Adherence to legal frameworks while protecting rights' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">{item.principle}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}