import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { GraduationCap, Play, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

const tutorials = [
  {
    title: "Getting Started with BuildSpaces",
    description: "Create your first workspace, explore the rooms, and meet the AI agents.",
    duration: "10 min",
    level: "Beginner",
    levelColor: "emerald",
    href: "#",
  },
  {
    title: "Code Chamber: Full IDE Walkthrough",
    description: "Master the Monaco editor, terminal, Git integration, and Elara pair programming.",
    duration: "15 min",
    level: "Beginner",
    levelColor: "emerald",
    href: "#",
  },
  {
    title: "Spec-Driven Development with Spec Chamber",
    description: "Write living specifications and generate tests automatically.",
    duration: "12 min",
    level: "Intermediate",
    levelColor: "amber",
    href: "#",
  },
  {
    title: "Working with AI Agents",
    description: "Learn to invoke agents, customize prompts, and use auto-routing.",
    duration: "20 min",
    level: "Intermediate",
    levelColor: "amber",
    href: "#",
  },
  {
    title: "Building a Full-Stack App in Maker Lab",
    description: "Scaffold, prototype, and deploy a complete application in one session.",
    duration: "30 min",
    level: "Intermediate",
    levelColor: "amber",
    href: "#",
  },
  {
    title: "Real-Time Collaboration in Collaboration Pod",
    description: "Set up team workspaces, pair program, and use the shared whiteboard.",
    duration: "15 min",
    level: "Beginner",
    levelColor: "emerald",
    href: "#",
  },
  {
    title: "Knowledge Ocean: Semantic Code Search",
    description: "Use vector search and knowledge graphs to navigate large codebases.",
    duration: "18 min",
    level: "Advanced",
    levelColor: "red",
    href: "#",
  },
  {
    title: "Constitutional AI: Understanding Ethics-First Development",
    description: "Deep dive into how Constitutional AI validates every agent action.",
    duration: "25 min",
    level: "Advanced",
    levelColor: "red",
    href: "#",
  },
]

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
              <GraduationCap className="h-3.5 w-3.5" />
              Tutorials
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Learn by
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> Doing</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Step-by-step guides to master every room, agent, and workflow in BuildSpaces.
            </p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tutorials.map((tutorial, i) => (
                <Link key={i} href={tutorial.href} className="block group">
                  <div className="h-full p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-0.5 rounded-full bg-${tutorial.levelColor}-500/10 text-${tutorial.levelColor}-400 text-[10px] font-bold uppercase`}>{tutorial.level}</span>
                      <span className="text-xs text-gray-600 flex items-center gap-1"><Clock className="h-3 w-3" />{tutorial.duration}</span>
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-emerald-400 transition-colors">{tutorial.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{tutorial.description}</p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-600 group-hover:text-emerald-400 transition-colors">
                      <Play className="h-3 w-3" /> Start Tutorial
                      <ArrowRight className="h-3 w-3 ml-auto" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
