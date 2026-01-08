import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Shield, Globe, Cpu, Users, Zap, Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              The Azora Vision
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We are building the cognitive infrastructure for the next era of human-AI collaboration. 
              Rooted in the philosophy of Ubuntu—"I am because we are"—Azora is more than a platform; 
              it's a digital ecosystem designed for collective intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed">
                At Azora, we believe that intelligence should be accessible, ethical, and sovereign. 
                Our mission is to provide the tools and frameworks that allow individuals and 
                organizations to build, deploy, and manage AI agents that respect human values 
                and constitutional principles.
              </p>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <Shield className="h-8 w-8 text-emerald-400" />
                <div>
                  <h4 className="font-bold">Constitutional AI</h4>
                  <p className="text-sm text-gray-400">Every action is verified against our core ethical principles.</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-8 flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-24 w-24 text-emerald-400/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <h3 className="text-6xl font-bold text-white/10">azora.world</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Cpu className="h-10 w-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Neural Orchestration</h3>
              <p className="text-gray-400 text-sm">Advanced routing across multiple LLM providers to ensure optimal performance and cost-efficiency.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Users className="h-10 w-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Collective Intelligence</h3>
              <p className="text-gray-400 text-sm">Built for teams to collaborate seamlessly with AI agents in shared workspaces.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Zap className="h-10 w-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Rapid Prototyping</h3>
              <p className="text-gray-400 text-sm">From idea to deployment in minutes with our unified UI and agent execution runtime.</p>
            </div>
          </div>

          <div className="text-center p-12 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10">
            <Heart className="h-12 w-12 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              We are just getting started. Whether you are a developer, a researcher, or a visionary, 
              there is a place for you in the Azora ecosystem.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/careers">View Careers</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Get in Touch</Link>
              </Button>
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
