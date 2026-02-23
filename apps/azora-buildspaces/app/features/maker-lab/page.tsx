'use client'

import { RoomPageLayout } from "@/components/layouts/room-page-layout"
import { Wrench, Lightbulb, TestTube, Zap, GitBranch, Rocket, Users } from "lucide-react"

export default function MakerLabPage() {
  return (
    <RoomPageLayout
      roomName="Maker Lab"
      roomTagline="Rapid Prototyping Environment"
      roomDescription="Transform ideas into working prototypes quickly. Experiment with new technologies, scaffold full-stack applications, and iterate rapidly in a sandboxed cloud environment."
      roomIcon={Wrench}
      accentColor="rose"
      demoHref="/demo-maker-lab"
      ctaTitle="Ready to Prototype?"
      ctaDescription="Start building and testing your ideas immediately — full-stack scaffolding in minutes."
      features={[
        { icon: Lightbulb, title: "Idea Prototyping", description: "Rapidly prototype and test new ideas with minimal setup" },
        { icon: TestTube, title: "Experiment Sandbox", description: "Safe environment to experiment with new technologies and frameworks" },
        { icon: Zap, title: "Quick Setup", description: "Pre-configured environments for popular tech stacks and tools" },
        { icon: GitBranch, title: "Version Control", description: "Built-in Git integration for tracking prototype iterations" },
        { icon: Rocket, title: "Deployment Ready", description: "Easily deploy prototypes to staging or production environments" },
        { icon: Users, title: "Team Collaboration", description: "Share prototypes with team members for feedback and iteration" },
      ]}
      capabilities={[
        "Full-stack application prototyping",
        "API development and testing",
        "Database schema design",
        "Microservice architecture",
        "Third-party integrations",
        "Performance testing",
        "Security testing",
        "Scalability experiments",
        "New technology evaluation",
        "Proof-of-concept development",
      ]}
      visual={
        <div className="rounded-2xl bg-[#161b22] border border-white/[0.06] overflow-hidden shadow-2xl shadow-rose-500/5">
          <div className="bg-[#0d1117] px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" /></div>
            <span className="text-xs text-gray-500 font-mono ml-3">maker-lab — scaffold</span>
          </div>
          <div className="p-5 font-mono text-[12px] space-y-2">
            <div className="text-rose-400">→ azora scaffold nextjs-saas</div>
            <div className="text-gray-500">✓ Created 47 files across 12 directories</div>
            <div className="text-gray-500">✓ Installed 28 dependencies</div>
            <div className="text-gray-500">✓ Database schema generated</div>
            <div className="text-gray-500">✓ API routes scaffolded</div>
            <div className="text-emerald-400">✓ Project ready at /workspace/my-saas</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-rose-400">→</span>
              <span className="w-[2px] h-4 bg-rose-400 animate-pulse" />
            </div>
          </div>
        </div>
      }
    />
  )
}
