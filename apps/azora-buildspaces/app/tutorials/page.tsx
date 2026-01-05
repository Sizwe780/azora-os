import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Play, BookOpen, Code, Cpu, Shield, Zap, Clock } from "lucide-react"
import Link from "next/link"

export default function TutorialsPage() {
  const tutorials = [
    {
      title: "Building Your First Agent",
      description: "A step-by-step guide to creating a custom agent using the Azora SDK.",
      level: "Beginner",
      duration: "15 min",
      icon: Cpu,
      category: "Development"
    },
    {
      title: "Implementing Constitutional Guardrails",
      description: "Learn how to define and enforce ethical principles for your AI agents.",
      level: "Intermediate",
      duration: "25 min",
      icon: Shield,
      category: "Safety"
    },
    {
      title: "Multi-Agent Orchestration",
      description: "How to coordinate multiple specialized agents to solve complex tasks.",
      level: "Advanced",
      duration: "40 min",
      icon: Zap,
      category: "Architecture"
    },
    {
      title: "Custom Tool Integration",
      description: "Connect your agents to external APIs and databases securely.",
      level: "Intermediate",
      duration: "20 min",
      icon: Code,
      category: "Integration"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Tutorials</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Master the Azora platform with hands-on guides and real-world 
              examples designed for builders of all levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {tutorials.map((tutorial) => (
              <div key={tutorial.title} className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/30 transition-all flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl bg-emerald-400/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <tutorial.icon className="h-8 w-8" />
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {tutorial.duration}
                    </span>
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
                      {tutorial.level}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 block">{tutorial.category}</span>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">{tutorial.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-8">{tutorial.description}</p>
                </div>
                <button className="flex items-center gap-2 text-emerald-400 font-bold hover:gap-3 transition-all">
                  Start Tutorial
                  <Play className="h-4 w-4 fill-current" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-12 rounded-3xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-full bg-emerald-400/10 text-emerald-400">
                <BookOpen className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Looking for the full reference?</h2>
                <p className="text-gray-400">Check out our comprehensive documentation for every API and tool.</p>
              </div>
            </div>
            <Link href="/docs" className="px-8 py-3 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-500 transition-colors whitespace-nowrap">
              Explore Documentation
            </Link>
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
