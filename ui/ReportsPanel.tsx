import { useQuery } from '@tanstack/react-query'
import { FileText, Download, Calendar } from 'lucide-react'
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load reports</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Generate New Report */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New Report</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['daily', 'weekly', 'monthly', 'quarterly', 'annual'].map((type) => (
            <button
              key={type}
              onClick={() => generateReport(type)}
              className="btn-primary capitalize"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Reports</h3>
        <div className="space-y-4">
          {reports && reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.reportId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-medium capitalize">{report.type} Report</h4>
                      <p className="text-sm text-gray-600">{report.summary?.period}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Score: {report.complianceScore}/100</div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Frameworks: {report.summary?.compliantFrameworks}/{report.summary?.totalFrameworks}
                  </div>
                  <div className="flex space-x-2">
                    {Object.keys(report.formats).map((format) => (
                      <button
                        key={format}
                        onClick={() => downloadReport(report.reportId, format)}
                        className="btn-secondary text-xs flex items-center"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No reports generated yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
