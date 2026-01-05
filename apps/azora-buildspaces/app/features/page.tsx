import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Code2, FileText, Palette, Brain, Terminal, Wrench, Users, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  const features = [
    {
      title: "Code Chamber",
      description: "A full-stack cloud IDE designed for the AI era. Write, test, and deploy code with real-time assistance from specialized agents.",
      icon: Code2,
      color: "emerald",
      href: "/features/code-chamber"
    },
    {
      title: "Spec Chamber",
      description: "Transform vague ideas into precise technical specifications. Automated validation ensures your requirements are production-ready.",
      icon: FileText,
      color: "blue",
      href: "/features/spec-chamber"
    },
    {
      title: "Design Studio",
      description: "Bridge the gap between design and code. Convert Figma designs to clean, responsive React components in seconds.",
      icon: Palette,
      color: "purple",
      href: "/features/design-studio"
    },
    {
      title: "AI Studio",
      description: "The nerve center for agent orchestration. Build complex workflows and coordinate multiple agents to solve high-level problems.",
      icon: Brain,
      color: "pink",
      href: "/features/ai-studio"
    },
    {
      title: "Command Desk",
      description: "Control your entire workspace with powerful slash commands. Automate repetitive tasks and trigger complex agent behaviors.",
      icon: Terminal,
      color: "amber",
      href: "/features/command-desk"
    },
    {
      title: "Maker Lab",
      description: "Rapidly scaffold full-stack applications. From database schemas to API endpoints, get your project started in minutes.",
      icon: Wrench,
      color: "rose",
      href: "/features/maker-lab"
    },
    {
      title: "Collaboration Pod",
      description: "Real-time teamwork for humans and AI. Share workspaces, co-edit code, and build together in a unified environment.",
      icon: Users,
      color: "cyan",
      href: "/features/collaboration-pod"
    },
    {
      title: "Knowledge Ocean",
      description: "AI-powered search and indexing for your entire codebase and documentation. Find exactly what you need, when you need it.",
      icon: Sparkles,
      color: "indigo",
      href: "/features/knowledge-ocean"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Platform Capabilities
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Azora BuildSpaces is a unified ecosystem of specialized rooms, 
              each designed to handle a specific stage of the product lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {features.map((feature) => (
              <Link 
                key={feature.title} 
                href={feature.href}
                className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/30 transition-all flex flex-col"
              >
                <div className={`p-3 rounded-xl bg-${feature.color}-400/10 text-${feature.color}-400 mb-6 group-hover:scale-110 transition-transform w-fit`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/10">
            <div>
              <h2 className="text-4xl font-bold mb-6">Powered by Constitutional AI</h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Every feature in BuildSpaces is built on a foundation of safety and ethics. 
                Our Constitutional AI layer ensures that agents always act in accordance 
                with your principles and security policies.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  <span className="text-gray-300">Real-time action verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-emerald-400" />
                  <span className="text-gray-300">Automated ethical auditing</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="h-16 w-16 text-emerald-400/20 mx-auto mb-4" />
                <p className="text-gray-500 font-mono text-sm">Verification Pipeline Active</p>
              </div>
            </div>
          </div>

          <div className="mt-20 text-center">
            <Link href="/" className="text-emerald-400 hover:underline">Back to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
