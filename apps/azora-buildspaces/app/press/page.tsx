import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Newspaper, Download, Mail, ExternalLink } from "lucide-react"
import Link from "next/link"

const pressReleases = [
  {
    title: "Azora Launches BuildSpaces: The World's First Ubuntu Ethics IDE",
    date: "January 15, 2026",
    excerpt: "Azora announces the alpha release of BuildSpaces, an open-source cloud IDE powered by Constitutional AI and 8 specialized AI agents with African-inspired identities.",
  },
  {
    title: "Introducing Constitutional AI for Software Development",
    date: "December 20, 2025",
    excerpt: "Azora's Constitutional AI framework ensures every AI-generated code suggestion, review, and action aligns with ethical principles of dignity, transparency, and collective benefit.",
  },
  {
    title: "Open Source Commitment: BuildSpaces Goes MIT License",
    date: "November 15, 2025",
    excerpt: "BuildSpaces will be fully open source under the MIT License, reflecting Azora's commitment to community-driven development and knowledge sharing.",
  },
]

export default function PressPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main>
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Newspaper className="h-3.5 w-3.5" />
              Press
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Press &
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Media</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              News, press releases, and media resources from Azora.
            </p>
          </div>
        </section>

        {/* Press Releases */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold mb-8">Press Releases</h2>
            <div className="space-y-4">
              {pressReleases.map((pr, i) => (
                <article key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs text-gray-500">{pr.date}</span>
                      <h3 className="text-lg font-semibold mt-1 mb-2 group-hover:text-purple-400 transition-colors">{pr.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{pr.excerpt}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-600 flex-shrink-0 mt-2" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Media Kit & Contact */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="p-3 rounded-xl bg-purple-500/10 w-fit mx-auto mb-4">
                <Download className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Media Kit</h3>
              <p className="text-sm text-gray-400 mb-6">Download logos, brand guidelines, and screenshots.</p>
              <button className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all">
                Download Kit
              </button>
            </div>
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="p-3 rounded-xl bg-blue-500/10 w-fit mx-auto mb-4">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Press Contact</h3>
              <p className="text-sm text-gray-400 mb-6">For press inquiries, interviews, and media coverage.</p>
              <Link href="mailto:press@azora.dev" className="inline-flex px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                press@azora.dev
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
