import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { BookOpen, Calendar, User, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function BlogPage() {
  const posts = [
    {
      title: "The Future of Human-AI Collaboration",
      excerpt: "Exploring how specialized agents and constitutional frameworks are redefining the development lifecycle.",
      date: "Dec 31, 2025",
      author: "Elara",
      category: "Vision"
    },
    {
      title: "Introducing BuildSpaces: A Unified UI for AI Agents",
      excerpt: "A deep dive into the 8 interconnected rooms that power the Azora development experience.",
      date: "Dec 28, 2025",
      author: "Azora Team",
      category: "Product"
    },
    {
      title: "Why Constitutional AI Matters for Enterprise",
      excerpt: "How real-time verification and ethical guardrails enable safe AI deployment at scale.",
      date: "Dec 20, 2025",
      author: "Security Team",
      category: "Safety"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Azora Blog
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Insights, updates, and deep dives into the world of 
              intelligent agents and constitutional AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {posts.map((post) => (
              <div key={post.title} className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/30 transition-all flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-400 transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-400/20 flex items-center justify-center">
                      <User className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-xs text-gray-400">{post.author}</span>
                  </div>
                  <button className="text-emerald-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center">
            <h2 className="text-2xl font-bold mb-4">Subscribe to our newsletter</h2>
            <p className="text-gray-400 mb-8">Get the latest Azora news and insights delivered to your inbox.</p>
            <form className="max-w-md mx-auto flex gap-2">
              <input 
                type="email" 
                placeholder="email@azora.world" 
                className="flex-grow p-3 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-400 outline-none transition-colors"
              />
              <button className="px-6 py-3 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-500 transition-colors">
                Subscribe
              </button>
            </form>
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
