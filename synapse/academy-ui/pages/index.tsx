import Link from "next/link"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-4 text-blue-700">Welcome to Azora Academy</h1>
      <p className="mb-6 text-lg text-gray-700 text-center max-w-xl">
        Africa’s first AI-powered university. Learn top skills, earn AZR, and build your future with interactive modules, AI professors, and real credentials.
      </p>
      <Link href="/courses" className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 shadow">
        Explore Courses
      </Link>
    </main>
  )
}