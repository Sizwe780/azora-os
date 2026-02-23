import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { BookOpen, Code2, Terminal, Palette, FileText, Brain, ArrowRight } from "lucide-react"
import Link from "next/link"

const sections = [
  {
    title: "Getting Started",
    icon: BookOpen,
    links: [
      { label: "Quick Start Guide", href: "#" },
      { label: "Creating Your First Workspace", href: "#" },
      { label: "Understanding the 8 Rooms", href: "#" },
      { label: "Working with AI Agents", href: "#" },
    ],
  },
  {
    title: "Code Chamber",
    icon: Code2,
    links: [
      { label: "Editor Configuration", href: "#" },
      { label: "Extensions & Plugins", href: "#" },
      { label: "Git Integration", href: "#" },
      { label: "Elara Pair Programming", href: "#" },
    ],
  },
  {
    title: "Command Desk",
    icon: Terminal,
    links: [
      { label: "CLI Reference", href: "#" },
      { label: "Custom Commands", href: "#" },
      { label: "Macro Engine", href: "#" },
      { label: "Agent Invocation", href: "#" },
    ],
  },
  {
    title: "Design Studio",
    icon: Palette,
    links: [
      { label: "Component Library", href: "#" },
      { label: "Theme Builder", href: "#" },
      { label: "Design Tokens", href: "#" },
      { label: "Figma Integration", href: "#" },
    ],
  },
  {
    title: "Spec Chamber",
    icon: FileText,
    links: [
      { label: "Writing Specs", href: "#" },
      { label: "Test Generation", href: "#" },
      { label: "Validation Engine", href: "#" },
      { label: "Coverage Tracking", href: "#" },
    ],
  },
  {
    title: "AI Agents",
    icon: Brain,
    links: [
      { label: "Agent Overview", href: "#" },
      { label: "Custom Prompts", href: "#" },
      { label: "Constitutional AI", href: "#" },
      { label: "Routing Configuration", href: "#" },
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <BookOpen className="h-3.5 w-3.5" />
              Documentation
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Learn
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> BuildSpaces</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Guides, references, and tutorials to help you get the most out of BuildSpaces.
            </p>
            {/* Search */}
            <div className="mt-8 max-w-xl mx-auto">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] focus-within:border-blue-500/40 transition-colors">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <input type="text" placeholder="Search documentation..." className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none text-sm" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, i) => (
                <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <section.icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="font-semibold">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.links.map((link, j) => (
                      <li key={j}>
                        <Link href={link.href} className="flex items-center justify-between text-sm text-gray-400 hover:text-white py-1.5 group transition-colors">
                          {link.label}
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Reference CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10" />
              <div className="absolute inset-0 bg-[#0d1117]/70 backdrop-blur-sm" />
              <div className="relative border border-blue-500/20 rounded-2xl p-12 text-center">
                <h2 className="text-2xl font-bold mb-4">API Reference</h2>
                <p className="text-gray-400 mb-6">Explore the full API for BuildSpaces programmatic access.</p>
                <Link href="/docs/api" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                  <Code2 className="h-4 w-4" /> View API Docs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
