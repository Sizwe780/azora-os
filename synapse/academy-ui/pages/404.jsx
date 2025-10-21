export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">404</h1>
        <div className="text-lg mb-4">Page not found.</div>
        <a href="/" className="text-blue-700 underline">Go Home</a>
      </div>
    </div>
  )
}