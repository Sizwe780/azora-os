import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Mail, MessageSquare, MapPin, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Have questions about Azora, BuildSpaces, or our AI infrastructure? 
              Our team is here to help you navigate the future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Mail className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">General Inquiries</h3>
              <p className="text-gray-400 text-sm mb-6">For general questions and partnership opportunities.</p>
              <a href="mailto:hello@azora.world" className="text-emerald-400 font-medium hover:underline">hello@azora.world</a>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
              <MessageSquare className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Sales & Enterprise</h3>
              <p className="text-gray-400 text-sm mb-6">For custom plans, enterprise deployments, and demos.</p>
              <a href="mailto:sales@azora.world" className="text-emerald-400 font-medium hover:underline">sales@azora.world</a>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Globe className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Support</h3>
              <p className="text-gray-400 text-sm mb-6">Need help with your workspace or agent execution?</p>
              <a href="mailto:support@azora.world" className="text-emerald-400 font-medium hover:underline">support@azora.world</a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Global Presence</h2>
                <p className="text-gray-400 leading-relaxed">
                  Azora is a distributed organization with a global footprint. 
                  While our roots are digital, our impact is felt across borders.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-emerald-400 mt-1" />
                  <div>
                    <h4 className="font-bold">Digital Headquarters</h4>
                    <p className="text-gray-400 text-sm">azora.world / decentralized</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-blue-500/5 border border-white/10">
              <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Name" className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-400 outline-none transition-colors" />
                  <input type="email" placeholder="Email" className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-400 outline-none transition-colors" />
                </div>
                <input type="text" placeholder="Subject" className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-400 outline-none transition-colors" />
                <textarea placeholder="Message" rows={4} className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-400 outline-none transition-colors resize-none"></textarea>
                <Button className="w-full py-6 text-lg">Send Message</Button>
              </form>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/" className="text-emerald-400 hover:underline">Back to home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
