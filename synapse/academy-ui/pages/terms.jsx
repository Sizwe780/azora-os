import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Terms of Service</h1>
            <div className="text-gray-700 text-sm">
              By using Azora, you agree to our terms. You must not misuse the platform or violate any laws.
              All content is provided as-is. For full details, contact legal@azora.local.
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}