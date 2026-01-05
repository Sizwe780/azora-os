import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Shield, Lock, Eye, FileText } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: December 31, 2025</p>
          </div>

          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">Our Commitment</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                At Azora, privacy is not an afterthought; it is a fundamental right. 
                Our infrastructure is built on the principle of data sovereignty. 
                We believe that you should own your data, your models, and your intelligence.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">Data Collection</h2>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                We collect only the minimum amount of data necessary to provide our services. 
                This includes:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Account information (email, name) for authentication.</li>
                <li>Workspace configuration and task metadata.</li>
                <li>Agent execution logs for debugging and constitutional auditing.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">How We Use Data</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your data is used exclusively to power your AI agents and improve your workspace experience. 
                We do not sell your data to third parties, and we do not use your private data to train 
                foundation models without your explicit, opt-in consent.
              </p>
            </section>

            <section className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-emerald-400" />
                <h2 className="text-xl font-bold">Constitutional Privacy</h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our privacy practices are governed by the Azora Constitution. 
                Any changes to how we handle data must be verified against our core principles 
                of transparency and user sovereignty.
              </p>
            </section>
          </div>

          <div className="mt-16 p-8 rounded-xl bg-emerald-400/5 border border-emerald-400/10 text-center">
            <p className="text-gray-400 mb-4">Questions about your privacy?</p>
            <a href="mailto:privacy@azora.world" className="text-emerald-400 font-bold hover:underline">privacy@azora.world</a>
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
