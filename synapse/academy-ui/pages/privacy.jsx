import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Privacy Policy</h1>
            <div className="text-gray-700 text-sm">
              We respect your privacy. Your data is stored securely and never shared without consent.
              You may request deletion or export of your data at any time.
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}