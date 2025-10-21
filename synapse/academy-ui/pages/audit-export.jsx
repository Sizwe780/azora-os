import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function AuditExportPage() {
  function handleExport() {
    window.open("/api/audit-export", "_blank")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Export Audit Logs</h1>
            <button
              className="px-4 py-2 bg-blue-700 text-white rounded"
              onClick={handleExport}
            >
              Download Audit Log (CSV)
            </button>
            <div className="mt-4 text-gray-600 text-sm">
              Download a full export of blockchain audit events for compliance or backup.
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}