import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function HelpPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Help & Documentation</h1>
            <ul className="mb-8 list-disc pl-6">
              <li>How to register and login</li>
              <li>How to access free and premium courses</li>
              <li>How to apply for jobs and post jobs</li>
              <li>How to manage notifications and exports</li>
              <li>Contact support: <a href="mailto:support@azora.local" className="text-blue-700 underline">support@azora.local</a></li>
            </ul>
            <div className="mt-8 text-gray-600 text-sm">
              For more guides, visit our <a href="/docs" className="text-blue-700 underline">developer docs</a>.
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}