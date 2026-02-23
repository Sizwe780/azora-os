'use client'

import { RoomPageLayout } from "@/components/layouts/room-page-layout"
import { BookOpen, Search, Database, Layers, Brain, GitBranch } from "lucide-react"

export default function KnowledgeOceanPage() {
  return (
    <RoomPageLayout
      roomName="Knowledge Ocean"
      roomTagline="AI-Powered Knowledge Graph"
      roomDescription="Explore, search, and navigate your entire codebase with AI-powered semantic understanding. Vector search, knowledge indexing, and deep contextual connections."
      roomIcon={BookOpen}
      accentColor="indigo"
      demoHref="/demo-knowledge-ocean"
      ctaTitle="Dive Into the Ocean"
      ctaDescription="Unlock deep understanding of your codebase — semantic search, knowledge graphs, and AI-powered documentation."
      features={[
        { icon: Search, title: "Semantic Search", description: "Find code by meaning, not just keywords — natural language queries across your entire codebase" },
        { icon: Database, title: "Vector Indexing", description: "Automatic embedding and indexing of every file, function, and comment in your project" },
        { icon: Layers, title: "Knowledge Graph", description: "Visual graph of connections between modules, functions, and concepts in your code" },
        { icon: Brain, title: "AI Summaries", description: "Instant AI-generated summaries of any file, module, or architectural pattern" },
        { icon: GitBranch, title: "Change Tracking", description: "Track how knowledge evolves across branches, PRs, and versions" },
        { icon: BookOpen, title: "Living Documentation", description: "Auto-generated docs that update as your codebase changes" },
      ]}
      capabilities={[
        "Full-text and semantic code search",
        "Dependency graph visualization",
        "Architecture pattern detection",
        "Cross-repository knowledge linking",
        "API surface discovery",
        "Code complexity analysis",
        "Technical debt identification",
        "Onboarding guide generation",
        "Impact analysis for changes",
        "Knowledge export and sharing",
      ]}
      visual={
        <div className="rounded-2xl bg-[#161b22] border border-white/[0.06] overflow-hidden shadow-2xl shadow-indigo-500/5">
          <div className="bg-[#0d1117] px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" /></div>
            <span className="text-xs text-gray-500 font-mono ml-3">knowledge-ocean — search</span>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs text-gray-400">how does the auth middleware work?</span>
            </div>
            <div className="text-[11px] text-gray-500">3 results · 12ms</div>
            <div className="space-y-2">
              {[
                { file: "middleware/auth.ts", match: "JWT validation and session management", score: "98%" },
                { file: "lib/session.ts", match: "Session store with Redis fallback", score: "87%" },
                { file: "api/auth/route.ts", match: "OAuth2 flow handlers", score: "82%" },
              ].map((r) => (
                <div key={r.file} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-400 font-mono">{r.file}</span>
                    <span className="text-[10px] text-gray-600">{r.score}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{r.match}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    />
  )
}
