import { RefreshCw, Shield } from 'lucide-react'

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
            <button
              onClick={onRefresh}
              className="btn-secondary flex items-center"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>

            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Live Data
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}