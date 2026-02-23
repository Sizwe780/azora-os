import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Eye } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Eye className="h-3.5 w-3.5" />
              Privacy Policy
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Privacy
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Policy</span>
            </h1>
            <p className="text-sm text-gray-500">Last updated: January 15, 2026</p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl prose prose-invert prose-sm">
            <div className="space-y-8">
              {[
                { title: "1. Information We Collect", content: "We collect information you provide directly (account details, workspace content) and usage data (analytics, error logs). We do NOT train AI models on your private code or sell your data to third parties." },
                { title: "2. How We Use Your Information", content: "Your data is used to: provide and improve the BuildSpaces service, authenticate your identity, process payments, send critical service notifications, and comply with legal obligations." },
                { title: "3. AI and Your Code", content: "When you use AI agents, your code context is processed to provide assistance. We do NOT retain your code for model training. All AI processing follows Constitutional AI principles. You can opt out of cloud AI and use local LLMs exclusively." },
                { title: "4. Data Storage and Security", content: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use SOC 2 Type II compliant infrastructure. Workspaces are isolated per user with strict access controls." },
                { title: "5. Data Sharing", content: "We do not sell your personal information. We share data only with: service providers who help operate the platform (under strict contracts), and when required by law." },
                { title: "6. Your Rights", content: "You have the right to: access your data, correct inaccurate data, delete your account and all associated data, export your data in standard formats, and opt out of non-essential data processing." },
                { title: "7. Cookies", content: "We use essential cookies for authentication and security. Analytics cookies are optional and can be disabled in your account settings." },
                { title: "8. GDPR Compliance", content: "For EU residents: Azora acts as a data controller. Our legal basis for processing is legitimate interest and contract performance. You may contact our DPO at privacy@azora.dev." },
                { title: "9. Changes", content: "We will notify users of material changes to this policy via email and in-app notification at least 30 days before changes take effect." },
                { title: "10. Contact", content: "For privacy questions or requests, contact us at privacy@azora.dev." },
              ].map((section, i) => (
                <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
                  <p className="text-sm text-gray-400 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
