import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Code, Terminal, Key, Globe, Shield, Zap, Copy } from "lucide-react"
import Link from "next/link"

export default function DocsAPIPage() {
  const endpoints = [
    { method: "GET", path: "/v1/agents", description: "List all available agents in your workspace." },
    { method: "POST", path: "/v1/agents/invoke", description: "Trigger an agent to perform a specific task." },
    { method: "GET", path: "/v1/workspaces", description: "Retrieve metadata for your active workspaces." },
    { method: "POST", path: "/v1/auth/token", description: "Generate a temporary access token for API requests." }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16">
            <h1 className="text-5xl font-bold mb-4">API Reference</h1>
            <p className="text-xl text-gray-400">
              Build custom integrations and automate your workflows with the 
              Azora REST API and SDKs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Key className="h-8 w-8 text-emerald-400" />
                  Authentication
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  All API requests must be authenticated using a Bearer token. 
                  You can generate API keys in your workspace settings.
                </p>
                <div className="p-4 rounded-lg bg-black/40 border border-white/10 font-mono text-sm text-emerald-400 flex justify-between items-center">
                  <span>Authorization: Bearer YOUR_API_KEY</span>
                  <Copy className="h-4 w-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Globe className="h-8 w-8 text-emerald-400" />
                  Core Endpoints
                </h2>
                <div className="space-y-4">
                  {endpoints.map((ep) => (
                    <div key={ep.path} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/30 transition-all">
                      <div className="flex items-center gap-4 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          ep.method === 'GET' ? 'bg-blue-400/10 text-blue-400' : 'bg-emerald-400/10 text-emerald-400'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="font-mono text-sm text-gray-300">{ep.path}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{ep.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-emerald-400" />
                  Official SDKs
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  We provide official libraries for popular languages to help you 
                  get started quickly.
                </p>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                    Node.js SDK
                    <span className="text-xs text-gray-500">v1.2.0</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                    Python SDK
                    <span className="text-xs text-gray-500">v1.0.5</span>
                  </button>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/10">
                <Shield className="h-8 w-8 text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Rate Limits</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Standard API keys are limited to 1,000 requests per minute. 
                  Enterprise customers enjoy unlimited throughput.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/docs" className="text-emerald-400 hover:underline">Back to Documentation</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
