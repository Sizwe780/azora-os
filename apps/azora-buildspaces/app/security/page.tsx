import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { ShieldCheck, Lock, Key, Server, Activity, Eye } from "lucide-react"
import Link from "next/link"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Security at Azora
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We employ multi-layered security protocols to ensure your data and 
              AI agents remain protected in an ever-evolving threat landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <Lock className="h-10 w-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">End-to-End Encryption</h3>
              <p className="text-gray-400 leading-relaxed">
                All data in transit is encrypted using TLS 1.3, and data at rest is 
                protected with AES-256 encryption. Your private keys never leave 
                your secure environment.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <ShieldCheck className="h-10 w-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Constitutional Guardrails</h3>
              <p className="text-gray-400 leading-relaxed">
                Our unique Constitutional AI layer monitors agent behavior in real-time, 
                preventing unauthorized actions and ensuring compliance with your 
                security policies.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <Key className="h-10 w-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Identity & Access</h3>
              <p className="text-gray-400 leading-relaxed">
                Granular RBAC (Role-Based Access Control) and MFA (Multi-Factor Authentication) 
                ensure that only authorized personnel can access sensitive workspace 
                configurations.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <Server className="h-10 w-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Infrastructure Security</h3>
              <p className="text-gray-400 leading-relaxed">
                Our services are hosted in SOC 2 Type II compliant data centers with 
                24/7 monitoring, automated threat detection, and regular penetration testing.
              </p>
            </div>
          </div>

          <div className="space-y-8 mb-16">
            <h2 className="text-3xl font-bold">Security Best Practices</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-6 rounded-xl bg-white/5 border border-white/10">
                <Activity className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Monitor Logs</h4>
                  <p className="text-sm text-gray-400">Regularly review agent execution logs in your dashboard for anomalies.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-xl bg-white/5 border border-white/10">
                <Eye className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Least Privilege</h4>
                  <p className="text-sm text-gray-400">Grant agents only the permissions they need to perform their specific tasks.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-12 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10 text-center">
            <h2 className="text-2xl font-bold mb-4">Found a vulnerability?</h2>
            <p className="text-gray-400 mb-8">We operate a bug bounty program for responsible disclosure of security issues.</p>
            <Button asChild size="lg">
              <a href="mailto:security@azora.world">Report a Security Issue</a>
            </Button>
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
