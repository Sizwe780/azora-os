import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Contact</h1>
          <p className="text-gray-400 mb-6">Get in touch for questions about BuildSpaces, integrations, and enterprise offers.</p>
          <div className="rounded-xl bg-white/5 p-6 border border-white/10">Reach us at <a href="mailto:hello@azora.world" className="text-emerald-400">hello@azora.world</a></div>
          <div className="mt-4">
            <Link href="/" className="text-emerald-400">Back to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
