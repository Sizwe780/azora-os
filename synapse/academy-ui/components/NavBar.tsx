import Link from "next/link"

export default function NavBar() {
  return (
    <nav className="bg-white shadow flex items-center px-8 py-3 mb-8">
      <Link href="/" className="font-bold text-xl text-blue-700 mr-8">Azora Academy</Link>
      <Link href="/courses" className="mr-6 hover:text-blue-500">Courses</Link>
      <Link href="/dashboard" className="mr-6 hover:text-blue-500">Dashboard</Link>
      <Link href="/marketplace" className="mr-6 hover:text-blue-500">Marketplace</Link>
      <Link href="/wallet" className="mr-6 hover:text-blue-500">Wallet</Link>
      <Link href="/community" className="mr-6 hover:text-blue-500">Community</Link>
      <Link href="/compliance" className="mr-6 hover:text-blue-500">Compliance</Link>
      <Link href="/career" className="mr-6 hover:text-blue-500">Career</Link>
      <Link href="/profile" className="mr-6 hover:text-blue-500">Profile</Link>
      <Link href="/ecosystem-stats" className="mr-6 hover:text-blue-500">Ecosystem Stats</Link>
      <Link href="/qualifications" className="mr-6 hover:text-blue-500">Qualifications</Link>
      <Link href="/degrees" className="mr-6 hover:text-blue-500">Degrees</Link>
      <Link href="https://identity.azora.world/login" className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Login</Link>
    </nav>
  )

}