'use client'

import { RoomPageLayout } from "@/components/layouts/room-page-layout"
import { FileText, CheckCircle, GitPullRequest, Shield, Brain, ListChecks, BarChart3 } from "lucide-react"

export default function SpecChamberPage() {
  return (
    <RoomPageLayout
      roomName="Spec Chamber"
      roomTagline="Intelligent Specification Engine"
      roomDescription="Write living specifications that evolve with your project. AI-assisted requirements, automated acceptance criteria, and real-time validation ensure nothing is lost in translation."
      roomIcon={FileText}
      accentColor="blue"
      demoHref="/demo-spec-chamber"
      ctaTitle="Start Specifying"
      ctaDescription="Write specifications that actually drive development — living docs that evolve with your codebase."
      features={[
        { icon: FileText, title: "Living Specs", description: "Specifications that update automatically as your codebase evolves" },
        { icon: CheckCircle, title: "Acceptance Criteria", description: "AI-generated acceptance criteria from natural language requirements" },
        { icon: Brain, title: "AI-Assisted Writing", description: "Intelligent suggestions for clearer, more complete specifications" },
        { icon: GitPullRequest, title: "PR Integration", description: "Specs linked directly to pull requests and code changes" },
        { icon: Shield, title: "Validation Engine", description: "Real-time validation ensures specs match implementation" },
        { icon: ListChecks, title: "Test Generation", description: "Automatically generate test cases from specifications" },
      ]}
      capabilities={[
        "Natural language requirement capture",
        "Automated acceptance criteria generation",
        "Spec-to-code traceability",
        "Stakeholder review workflows",
        "Version-controlled specifications",
        "Test case generation from specs",
        "Requirement gap analysis",
        "Dependency mapping",
        "Impact analysis on changes",
        "Compliance documentation",
      ]}
      visual={
        <div className="rounded-2xl bg-[#161b22] border border-white/[0.06] overflow-hidden shadow-2xl shadow-blue-500/5">
          <div className="bg-[#0d1117] px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" /></div>
            <span className="text-xs text-gray-500 font-mono ml-3">spec-chamber — requirements.md</span>
          </div>
          <div className="p-5 font-mono text-[12px] space-y-3">
            <div className="text-blue-400 font-bold"># User Authentication Spec</div>
            <div className="text-gray-400 text-[11px]">Status: <span className="text-emerald-400">✓ Validated</span> · Coverage: <span className="text-blue-300">94%</span></div>
            <div className="border-t border-white/[0.06] pt-2">
              <div className="text-gray-300">## Acceptance Criteria</div>
              <div className="text-emerald-400 mt-1">✓ Users can sign up with email</div>
              <div className="text-emerald-400">✓ OAuth2 flow with Google/GitHub</div>
              <div className="text-emerald-400">✓ Session management with JWT</div>
              <div className="text-yellow-400">⟳ Rate limiting on auth endpoints</div>
              <div className="text-gray-600">○ 2FA via authenticator app</div>
            </div>
            <div className="text-gray-600 text-[10px] mt-2">3 of 5 criteria implemented · 1 in progress</div>
          </div>
        </div>
      }
    />
  )
}
