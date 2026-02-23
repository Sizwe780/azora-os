'use client'

import { RoomPageLayout } from "@/components/layouts/room-page-layout"
import { Palette, Layout, Component, Figma, Code2, Zap, Users } from "lucide-react"

export default function DesignStudioPage() {
  return (
    <RoomPageLayout
      roomName="Design Studio"
      roomTagline="Design Systems & Components"
      roomDescription="Bridge design and code. Import Figma designs, build component libraries, generate design tokens, and ship responsive UI systems — all with AI assistance."
      roomIcon={Palette}
      accentColor="purple"
      demoHref="/demo-design-studio"
      ctaTitle="Ready to Design?"
      ctaDescription="Import from Figma, build components, and ship design systems with AI-powered code generation."
      features={[
        { icon: Figma, title: "Figma Integration", description: "Import designs directly from Figma and convert to React components" },
        { icon: Component, title: "Component Library", description: "Build and manage reusable UI components with TypeScript support" },
        { icon: Layout, title: "Layout Systems", description: "Create responsive layouts with CSS Grid, Flexbox, and Tailwind CSS" },
        { icon: Code2, title: "Design-to-Code", description: "Convert designs to production-ready code with AI assistance" },
        { icon: Users, title: "Design Collaboration", description: "Share designs, get feedback, and collaborate with your team" },
        { icon: Zap, title: "Rapid Prototyping", description: "Quickly iterate on designs with hot-reload and live preview" },
      ]}
      capabilities={[
        "UI/UX design systems",
        "Component development",
        "Responsive design",
        "Design token management",
        "Figma to React conversion",
        "Style guide generation",
        "Accessibility compliance",
        "Cross-platform design",
        "Animation and transitions",
        "Design system documentation",
      ]}
      visual={
        <div className="rounded-2xl bg-[#161b22] border border-white/[0.06] overflow-hidden shadow-2xl shadow-purple-500/5 p-5">
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Header", h: 56, color: "purple" }, { label: "Sidebar", h: 80, color: "pink" }, { label: "Hero Section", h: 72, color: "purple" }, { label: "Content Grid", h: 96, color: "indigo" }].map((block, i) => (
              <div key={i} className="rounded-xl border border-purple-500/20 bg-purple-500/[0.06] flex items-center justify-center hover:bg-purple-500/10 transition-colors" style={{ height: block.h }}>
                <span className="text-[11px] text-purple-400 font-medium">{block.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Imani generating tokens...
          </div>
        </div>
      }
    />
  )
}
