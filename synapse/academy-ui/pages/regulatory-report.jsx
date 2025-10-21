import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function RegulatoryReportPage() {
  function handleDownload() {
    window.open("/api/regulatory-report", "_blank")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Regulatory Reporting</h1>
            <button
              className="px-4 py-2 bg-blue-700 text-white rounded"
              onClick={handleDownload}
            >
              Download Regulatory Report (CSV)
            </button>
            <div className="mt-4 text-gray-600 text-sm">
              Download a ready-to-submit compliance report for POPIA, ISO, CHE, and more.
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}