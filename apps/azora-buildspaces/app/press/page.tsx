import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Newspaper, Download, Image as ImageIcon, FileText, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PressPage() {
  const news = [
    {
      date: "Dec 31, 2025",
      title: "Azora Launches BuildSpaces: A New Era for Agent Orchestration",
      source: "Azora Newsroom"
    },
    {
      date: "Dec 15, 2025",
      title: "The Ubuntu Philosophy in AI: Why Collective Intelligence Matters",
      source: "Tech Insights"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Press & Media</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Resources and news for journalists, researchers, and media professionals 
              covering the Azora ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Newspaper className="h-8 w-8 text-emerald-400" />
                Latest News
              </h2>
              <div className="space-y-4">
                {news.map((item, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/30 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-gray-500 text-sm">{item.date}</span>
                      <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">{item.source}</span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-bold">Media Kit</h2>
              <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/10">
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Download our official logos, brand guidelines, and high-resolution 
                  product screenshots.
                </p>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-4 w-4 text-emerald-400" />
                      Logos & Brand Assets
                    </div>
                    <Download className="h-4 w-4 opacity-50" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      Company Fact Sheet
                    </div>
                    <Download className="h-4 w-4 opacity-50" />
                  </button>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-emerald-400" />
                  Media Inquiries
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  For interview requests or additional information, please contact our PR team.
                </p>
                <a href="mailto:press@azora.world" className="text-emerald-400 font-bold hover:underline">press@azora.world</a>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/contact" className="text-emerald-400 hover:underline">Contact Us</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
