/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { CheckCircle, AlertCircle, XCircle, ExternalLink } from 'lucide-react'
import { Framework } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FrameworkStatusGridProps {
  frameworks: Framework[]
}

const statusConfig = {
  compliant: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    badge: 'default' as const
  },
  'needs-attention': {
    icon: AlertCircle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    badge: 'secondary' as const
  },
  'non-compliant': {
    icon: XCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    badge: 'destructive' as const
  }
}

export function FrameworkStatusGrid({ frameworks }: FrameworkStatusGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Framework Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {frameworks.map((framework) => {
            const config = statusConfig[framework.status]
            const Icon = config.icon

            return (
              <div
                key={framework.id}
                className={`border rounded-lg p-4 ${config.className}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2" />
                    <div>
                      <h4 className="font-medium">{framework.name}</h4>
                      <Badge variant={config.badge} className="mt-1">
                        {framework.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{framework.region} • {framework.category}</span>
                  <span className="font-medium">{framework.complianceScore}/100</span>
                </div>

                {framework.issues.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Issues:</p>
                    <ul className="text-sm space-y-1">
                      {framework.issues.slice(0, 3).map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-xs mr-2">•</span>
                          <span className="flex-1">{issue}</span>
                        </li>
                      ))}
                      {framework.issues.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{framework.issues.length - 3} more issues
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="mt-3 text-xs text-muted-foreground">
                  Updated: {new Date(framework.lastUpdated).toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}