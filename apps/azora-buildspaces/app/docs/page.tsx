import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Book, Code, Terminal, Cpu, Shield, Zap, Search } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  const categories = [
    {
      title: "Getting Started",
      description: "Learn the basics of Azora and set up your first workspace.",
      icon: Book,
      links: ["Introduction", "Quick Start Guide", "Core Concepts"]
    },
    {
      title: "Agent Framework",
      description: "Build and deploy intelligent agents using our SDK.",
      icon: Cpu,
      links: ["BaseAgent API", "Memory Management", "Tool Integration"]
    },
    {
      title: "Constitutional AI",
      description: "Implement ethical guardrails and auditing for your agents.",
      icon: Shield,
      links: ["Divine Law Principles", "Verification Pipeline", "Audit Logs"]
    },
    {
      title: "API Reference",
      description: "Detailed documentation for our REST and WebSocket APIs.",
      icon: Code,
      links: ["Authentication", "Endpoints", "Webhooks"]
    },
    {
      title: "CLI Tools",
      description: "Manage your infrastructure from the command line.",
      icon: Terminal,
      links: ["Installation", "Commands", "Configuration"]
    },
    {
      title: "Advanced Guides",
      description: "Deep dives into scaling, security, and custom models.",
      icon: Zap,
      links: ["Performance Tuning", "Security Hardening", "Custom Adapters"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold mb-4">Documentation</h1>
              <p className="text-xl text-gray-400">
                Everything you need to build, deploy, and scale intelligent 
                agents on the Azora platform.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search documentation..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-400 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {categories.map((cat) => (
              <div key={cat.title} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/30 transition-all group">
                <cat.icon className="h-10 w-10 text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-3">{cat.title}</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{cat.description}</p>
                <ul className="space-y-2">
                  {cat.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-emerald-400/80 hover:text-emerald-400 text-sm flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-emerald-400/40" />
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="p-12 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10 text-center">
            <h2 className="text-2xl font-bold mb-4">Need more help?</h2>
            <p className="text-gray-400 mb-8">Join our community of developers or reach out to our support team.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#" className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium">Community Discord</Link>
              <Link href="/contact" className="px-6 py-2 rounded-lg bg-emerald-400 text-black hover:bg-emerald-500 transition-colors font-medium">Contact Support</Link>
            </div>
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
