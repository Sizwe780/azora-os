import React from "react";
import Sidebar from "./components/azora/Sidebar";
import BeamsBackground from "./components/azora/BeamsBackground";
import ThemeToggle from "./components/azora/ThemeToggle";
import GlassPanel from "./components/azora/atoms/GlassPanel";

export default function App() {
  return (
    <div className="relative min-h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden flex">
      {/* Animated background beams */}
      <BeamsBackground />

      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 p-8 grid gap-8 md:grid-cols-2 relative z-10">
        {/* User Info Card */}
        <GlassPanel accent="premium" animated>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-cyan-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              D
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Demo User</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Citizen · <span className="text-green-400">online</span></div>
            </div>
          </div>
          <div className="text-white/80">Premium user profile info, notifications, and quick actions go here.</div>
        </GlassPanel>

        {/* Advisor Insights */}
        <GlassPanel accent="info">
          <h2 className="text-xl font-bold text-white mb-2">Advisor</h2>
          <ul className="list-disc list-inside text-white/80 pl-2">
            <li>Compliance risk detected in the latest proposal. Review contract terms and improve error handling.</li>
            <li>Federation activity surge. Monitor cross-nation proposals for alignment.</li>
          </ul>
        </GlassPanel>

        {/* Federation Overview */}
        <GlassPanel accent="success">
          <h2 className="text-xl font-bold text-white mb-2">Federation Overview</h2>
          <div className="flex flex-col gap-1 text-white/80">
            <div><span className="font-semibold">Nation:</span> Azora Core, Azora Trade, Azora Research</div>
            <div><span className="font-semibold">Citizens:</span> 12, 8, 5</div>
            <div><span className="font-semibold">Reputation:</span> 5,640, 2,800, 1,960</div>
            <div className="text-xs mt-2 text-white/60">
              Your User ID: <span className="font-mono">demo_user</span>
            </div>
          </div>
        </GlassPanel>

        {/* Reputation Economy */}
        <GlassPanel accent="cosmic" animated>
          <h2 className="text-xl font-bold text-white mb-2">Reputation Economy</h2>
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl font-bold text-yellow-400">13,000</span>
            <span className="flex items-center gap-2 text-white/80"><span>⚡</span>azora</span>
            <div className="text-white/60 text-sm">Gamified reputation system and metrics.</div>
          </div>
        </GlassPanel>
      </main>

      {/* Floating theme toggle */}
      <div className="fixed bottom-6 right-6 z-20">
        <ThemeToggle />
      </div>
    </div>
  );
}
