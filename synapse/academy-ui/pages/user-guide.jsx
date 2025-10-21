import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function UserGuidePage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">User Guide</h1>
            <ul className="mb-8 list-disc pl-6">
              <li>Register or login to access your dashboard.</li>
              <li>Browse courses and apply for jobs.</li>
              <li>Export or delete your data from your dashboard.</li>
              <li>Contact support for help.</li>
            </ul>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}