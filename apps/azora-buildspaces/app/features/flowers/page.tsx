import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Heart, Sun, Wind, CloudRain, Sparkles } from "lucide-react"
import Link from "next/link"

export default function FlowersPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white overflow-hidden">
      <Navbar />
      <main className="relative py-24 px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 animate-bounce">
            <Heart className="h-10 w-10 text-emerald-400" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
            Ubuntu Garden
          </h1>
          
          <p className="text-2xl text-gray-400 mb-12 leading-relaxed italic">
            "I am because we are."
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="flex flex-col items-center gap-4 group">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-yellow-400/50 transition-all">
                <Sun className="h-8 w-8 text-yellow-400" />
              </div>
              <span className="text-sm font-medium text-gray-500">Energy</span>
            </div>
            <div className="flex flex-col items-center gap-4 group">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-blue-400/50 transition-all">
                <CloudRain className="h-8 w-8 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-500">Nurture</span>
            </div>
            <div className="flex flex-col items-center gap-4 group">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-emerald-400/50 transition-all">
                <Wind className="h-8 w-8 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-gray-500">Spirit</span>
            </div>
            <div className="flex flex-col items-center gap-4 group">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-purple-400/50 transition-all">
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-500">Magic</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-2xl mx-auto">
            <p className="text-gray-300 leading-relaxed">
              This is a space for growth, reflection, and the celebration of 
              human-AI synergy. Just as a garden requires diverse elements to 
              thrive, our ecosystem flourishes through the unique contributions 
              of every agent and every user.
            </p>
          </div>

          <div className="mt-16">
            <Link href="/features" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
              <span>Return to the Workspace</span>
              <div className="w-4 h-px bg-emerald-400/50" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
