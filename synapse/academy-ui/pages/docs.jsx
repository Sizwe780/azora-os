// filepath: /workspaces/azora-os/synapse/academy-ui/pages/contact.jsx
import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function ContactPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Contact & Support</h1>
            <div className="mb-4">
              <strong>Email:</strong> <a href="mailto:support@azora.local" className="text-blue-700 underline">support@azora.local</a>
            </div>
            <div className="mb-4">
              <strong>Phone:</strong> +27 11 123 4567
            </div>
            <div className="mb-4">
              <strong>Live Chat:</strong> <a href="/chat" className="text-blue-700 underline">Open Chat</a>
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}          