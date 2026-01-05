import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Scale, Gavel, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-gray-400">Last updated: December 31, 2025</p>
          </div>

          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-6 w-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                By accessing or using the Azora platform and BuildSpaces, you agree to be bound by these 
                Terms of Service and our Constitutional AI principles. If you do not agree to these terms, 
                please do not use our services.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">2. Use of Services</h2>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                You are responsible for all activity that occurs under your account. 
                You agree to use the services only for lawful purposes and in accordance 
                with the Azora Constitution.
              </p>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex gap-4">
                <AlertCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-1" />
                <p className="text-sm text-gray-400">
                  Misuse of AI agents to generate harmful, illegal, or unethical content 
                  is a violation of these terms and will result in immediate account suspension.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Gavel className="h-6 w-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">3. Intellectual Property</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                You retain all rights to the content you create and the data you provide. 
                Azora retains all rights to the platform infrastructure, agent frameworks, 
                and proprietary algorithms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Limitation of Liability</h2>
              <p className="text-gray-400 leading-relaxed">
                Azora provides its services "as is" and "as available." We do not guarantee 
                that the services will be uninterrupted or error-free. In no event shall 
                Azora be liable for any indirect, incidental, or consequential damages.
              </p>
            </section>
          </div>

          <div className="mt-16 p-8 rounded-xl bg-emerald-400/5 border border-emerald-400/10 text-center">
            <p className="text-gray-400 mb-4">Legal questions?</p>
            <a href="mailto:legal@azora.world" className="text-emerald-400 font-bold hover:underline">legal@azora.world</a>
          </div>

          <div className="mt-12 text-center">
            <Link href="/" className="text-emerald-400 hover:underline">Back to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
