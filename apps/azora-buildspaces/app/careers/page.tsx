import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { Briefcase, Rocket, Heart, Code, Palette, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CareersPage() {
  const positions = [
    {
      title: "AI Systems Engineer",
      department: "Engineering",
      location: "Remote / Global",
      icon: Code
    },
    {
      title: "Constitutional AI Researcher",
      department: "Research",
      location: "Remote / Global",
      icon: Rocket
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote / Global",
      icon: Palette
    },
    {
      title: "Growth Strategist",
      department: "Marketing",
      location: "Remote / Global",
      icon: BarChart
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Build the Future with Us
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We are looking for visionaries, builders, and thinkers who want to 
              shape the next generation of AI infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Heart className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Ubuntu Culture</h3>
              <p className="text-gray-400 text-sm">We believe in collective success and mutual growth. Your impact is our impact.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Briefcase className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Radical Autonomy</h3>
              <p className="text-gray-400 text-sm">Work from anywhere, on your own terms. We value results over hours.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Rocket className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Cutting Edge</h3>
              <p className="text-gray-400 text-sm">Work with the latest in AI orchestration, constitutional AI, and distributed systems.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
          <div className="grid grid-cols-1 gap-4 mb-16">
            {positions.map((job) => (
              <div key={job.title} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/50 transition-all flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-3 rounded-lg bg-emerald-400/10 text-emerald-400">
                    <job.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                    <p className="text-gray-400 text-sm">{job.department} • {job.location}</p>
                  </div>
                </div>
                <Button variant="outline">Apply Now</Button>
              </div>
            ))}
          </div>

          <div className="text-center p-12 rounded-3xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold mb-4">Don't see a perfect fit?</h2>
            <p className="text-gray-400 mb-8">We are always looking for exceptional talent. Send us an open application.</p>
            <Button asChild size="lg">
              <a href="mailto:jobs@azora.world">Email your CV to jobs@azora.world</a>
            </Button>
          </div>

          <div className="mt-12 text-center">
            <Link href="/about" className="text-emerald-400 hover:underline">Learn more about Azora</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
