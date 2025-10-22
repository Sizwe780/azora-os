/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { RefreshCw, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  onRefresh: () => void
}

export function Header({ onRefresh }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Azora OS Compliance Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Unified compliance monitoring across all regulatory frameworks
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <div className="flex items-center text-sm text-gray-500">
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Live Data
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}