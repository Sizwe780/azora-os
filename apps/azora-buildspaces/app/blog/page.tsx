import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

const posts = [
  {
    title: "Introducing BuildSpaces: The Ubuntu Ethics IDE",
    excerpt: "We're building the world's first IDE where AI agents collaborate with developers guided by constitutional principles.",
    date: "2026-01-15",
    tag: "Announcement",
    tagColor: "emerald",
    slug: "#",
  },
  {
    title: "Meet the AI Family: 8 Agents, 8 Specialties",
    excerpt: "A deep dive into Elara, Sankofa, Themba, Jabari, Nia, Imani, Zuri, and Kwame — the agents powering BuildSpaces.",
    date: "2026-01-10",
    tag: "AI",
    tagColor: "purple",
    slug: "#",
  },
  {
    title: "Why Constitutional AI Matters for Development",
    excerpt: "Every AI action validated against ethical principles. Here's why that makes your code better, not slower.",
    date: "2026-01-05",
    tag: "Ethics",
    tagColor: "blue",
    slug: "#",
  },
  {
    title: "The 8 Rooms: A Tour of BuildSpaces",
    excerpt: "From Code Chamber to Knowledge Ocean — explore every room in the BuildSpaces platform.",
    date: "2025-12-28",
    tag: "Product",
    tagColor: "amber",
    slug: "#",
  },
  {
    title: "Open Source and Ubuntu: Building in the Open",
    excerpt: "Why we chose to be 100% open source and how the Ubuntu philosophy shapes our development process.",
    date: "2025-12-20",
    tag: "Open Source",
    tagColor: "cyan",
    slug: "#",
  },
  {
    title: "Designing for Developer Experience in 2026",
    excerpt: "Dark glass, ambient glows, and purposeful motion — the design philosophy behind BuildSpaces.",
    date: "2025-12-15",
    tag: "Design",
    tagColor: "pink",
    slug: "#",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
              <BookOpen className="h-3.5 w-3.5" />
              Blog
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Insights &
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> Updates</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              News, tutorials, and deep dives from the Azora team.
            </p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-5">
              {posts.map((post, i) => (
                <Link key={i} href={post.slug} className="block group">
                  <article className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-2 py-0.5 rounded-full bg-${post.tagColor}-500/10 text-${post.tagColor}-400 text-[10px] font-bold uppercase tracking-wider`}>{post.tag}</span>
                          <span className="text-xs text-gray-600">{post.date}</span>
                        </div>
                        <h2 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">{post.title}</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">{post.excerpt}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </article>
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
