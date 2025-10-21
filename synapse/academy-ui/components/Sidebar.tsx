import Link from "next/link"

export default function Sidebar() {
  return (
    <aside className="w-64 h-full bg-gray-100 shadow flex flex-col py-6 px-4">
      <Link href="/" className="font-bold text-2xl text-blue-700 mb-8">Azora Academy</Link>
      <Link href="/dashboard" className="mb-4 hover:text-blue-500">Dashboard</Link>
      <Link href="/courses" className="mb-4 hover:text-blue-500">Courses</Link>
      <Link href="/qualifications" className="mb-4 hover:text-blue-500">Qualifications</Link>
      <Link href="/marketplace" className="mb-4 hover:text-blue-500">Marketplace</Link>
      <Link href="/wallet" className="mb-4 hover:text-blue-500">Wallet</Link>
      <Link href="/community" className="mb-4 hover:text-blue-500">Community</Link>
      <Link href="/career" className="mb-4 hover:text-blue-500">Career</Link>
      <Link href="/compliance" className="mb-4 hover:text-blue-500">Compliance</Link>
      <Link href="/constitution" className="mt-auto text-xs text-gray-500 hover:text-blue-700">Azora Constitution</Link>
    </aside>
  )
}