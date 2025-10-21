import Sidebar from "../../../ui/Sidebar"
import TopBar from "../../../ui/TopBar"
import MainLayout from "../../../ui/MainLayout"

export default function PricingPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <MainLayout>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Access & Pricing Options</h1>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2 text-green-700">Free Knowledge</h2>
              <ul className="mb-4">
                <li>✔ Access all core modules and learning materials</li>
                <li>✔ Community support and open forums</li>
                <li>✔ Portfolio builder and basic credential wallet</li>
              </ul>
              <div className="font-semibold text-gray-700 mb-4">
                <span className="text-green-700">No cost.</span>  
                Learning is a right, not a privilege.
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-blue-700">Premium Pathways</h2>
              <ul className="mb-4">
                <li>✔ Personal AI tutor and adaptive exam prep</li>
                <li>✔ Premium analytics and mastery dashboard</li>
                <li>✔ Live exam scheduling and proctoring</li>
                <li>✔ Accredited credentials and graduation</li>
                <li>✔ Career marketplace and mentorship matching</li>
              </ul>
              <div className="font-semibold text-gray-700 mb-4">
                <span className="text-blue-700">Affordable pricing.</span>  
                Pay only for what you need—no hidden fees.
              </div>
              <button className="px-4 py-2 bg-blue-700 text-white rounded">
                Upgrade to Premium
              </button>
            </div>
            <div className="mt-8 text-gray-600 text-sm">
              <strong>Your choice:</strong>  
              Pursue higher education, upskill for free, or mix and match.  
              The future is open.
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  )
}