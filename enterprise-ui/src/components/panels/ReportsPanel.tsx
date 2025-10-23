/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useQuery } from '@tanstack/react-query'
import { FileText, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ComplianceReport } from '../../types'

export function ReportsPanel() {
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['compliance-reports'],
    queryFn: async (): Promise<ComplianceReport[]> => {
      const response = await fetch('http://localhost:4087/api/reports')
      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }
      return response.json().then(data => data.data)
    },
    refetchInterval: 60000, // Refetch every minute
  })

  const generateReport = async (type: string) => {
    try {
      const response = await fetch('http://localhost:4087/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        // Refetch reports
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  const downloadReport = async (reportId: string, format: string) => {
    try {
      const response = await fetch(`http://localhost:4087/api/reports/${reportId}/download/${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `compliance-report-${reportId}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download report:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">Failed to load reports</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Generate New Report */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['daily', 'weekly', 'monthly', 'quarterly', 'annual'].map((type) => (
              <Button
                key={type}
                onClick={() => generateReport(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Reports</h3>
              <p className="text-gray-500 mb-4">Generate and download comprehensive compliance reports</p>
              <Button onClick={() => alert('Report generation coming soon!')}>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}