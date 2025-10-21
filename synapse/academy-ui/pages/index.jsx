export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Welcome to Azora</h1>
        <div className="mb-6 text-lg text-gray-700">Open learning, credentials, and jobs for all.</div>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="/auth" className="px-4 py-2 bg-blue-700 text-white rounded">Login / Register</a>
          <a href="/course-catalogue" className="px-4 py-2 bg-green-700 text-white rounded">Browse Courses</a>
          <a href="/job-marketplace" className="px-4 py-2 bg-purple-700 text-white rounded">Job Marketplace</a>
          <a href="/about" className="px-4 py-2 bg-gray-700 text-white rounded">About</a>
          <a href="/help" className="px-4 py-2 bg-gray-700 text-white rounded">Help</a>
        </div>
      </div>
    </div>
  )
}