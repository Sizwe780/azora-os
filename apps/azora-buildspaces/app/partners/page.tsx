import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Handshake, Globe, Cpu, Shield, Zap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PartnersPage() {
  const partnerTypes = [
    {
      title: "Technology Partners",
      description: "Integrate your AI models, infrastructure, or tools directly into the Azora ecosystem.",
      icon: Cpu
    },
    {
      title: "Solution Partners",
      description: "Help organizations deploy and manage Azora-based AI solutions for their specific needs.",
      icon: Zap
    },
    {
      title: "Research Partners",
      description: "Collaborate on the future of constitutional AI and ethical agent frameworks.",
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Partner with Azora
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join a global network of innovators building the next generation 
              of intelligent, ethical, and sovereign AI infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {partnerTypes.map((type) => (
              <div key={type.title} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/30 transition-all">
                <type.icon className="h-12 w-12 text-emerald-400 mb-6" />
                <h3 className="text-2xl font-bold mb-4">{type.title}</h3>
                <p className="text-gray-400 leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-3xl p-12 border border-white/10 mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Why Partner with Us?</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Globe className="h-6 w-6 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="font-bold mb-1">Global Reach</h4>
                      <p className="text-gray-400 text-sm">Access a worldwide community of developers and enterprises building on Azora.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Handshake className="h-6 w-6 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="font-bold mb-1">Co-Marketing</h4>
                      <p className="text-gray-400 text-sm">Joint webinars, case studies, and event opportunities to showcase our collaboration.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Users className="h-6 w-6 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="font-bold mb-1">Technical Support</h4>
                      <p className="text-gray-400 text-sm">Direct access to our engineering team and early access to new APIs and features.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-2xl bg-black/40 border border-white/5">
                <h3 className="text-2xl font-bold mb-6">Become a Partner</h3>
                <form className="space-y-4">
                  <input type="text" placeholder="Company Name" className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-400 outline-none transition-colors" />
                  <input type="email" placeholder="Work Email" className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-400 outline-none transition-colors" />
                  <select className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-400 outline-none transition-colors text-gray-400">
                    <option value="">Select Partner Type</option>
                    <option value="tech">Technology Partner</option>
                    <option value="solution">Solution Partner</option>
                    <option value="research">Research Partner</option>
                  </select>
                  <textarea placeholder="Tell us about your interest..." rows={3} className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-400 outline-none transition-colors resize-none"></textarea>
                  <Button className="w-full py-6 text-lg">Submit Application</Button>
                </form>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 mb-8">Interested in a quick chat first?</p>
            <a href="mailto:partners@azora.world" className="text-emerald-400 font-bold text-xl hover:underline">partners@azora.world</a>
          </div>

          <div className="mt-20 text-center">
            <Link href="/about" className="text-emerald-400 hover:underline">Learn more about Azora</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
