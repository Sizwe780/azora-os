import React from "react";
import BeamsBackground from "./BeamsBackground";
// If you have a Sidebar or ThemeToggle, import them here as well

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
      {/* Animated glassmorphic beams background */}
      <BeamsBackground />

      {/* Main Glass Panel */}
      <div className="relative z-10 w-full max-w-4xl p-8 rounded-2xl bg-white/30 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-slate-800/40">
        <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white text-center">
          Azora Intelligent Logistics Console
        </h1>
        <p className="text-center text-lg mb-8 text-slate-600 dark:text-slate-300">
          Welcome to your premium dashboard ✨
        </p>

        <section className="mb-8">
          {/* Example: User Card */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-slate-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              D
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Demo User</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Citizen · <span className="text-green-500">online</span></div>
            </div>
          </div>
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-xl p-4 mb-4 shadow">
            <div className="font-medium text-slate-800 dark:text-slate-100 mb-1">Governance Advisor</div>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 text-sm">
              <li>Compliance risk detected in the latest proposal. Review contract terms and improve error handling.</li>
              <li>Federation activity surge. Monitor cross-nation proposals for alignment.</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          {/* Federation Overview Section */}
          <div className="bg-white/40 dark:bg-slate-800/60 rounded-xl shadow p-6 mb-4">
            <div className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Federation Overview</div>
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="font-semibold">Nation</div>
                <div>Azora Core</div>
                <div>Azora Trade</div>
                <div>Azora Research</div>
                <div className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                  Your User ID: <span className="font-mono">demo_user</span>
                </div>
              </div>
              <div>
                <div className="font-semibold">Citizens</div>
                <div>12</div>
                <div>8</div>
                <div>5</div>
              </div>
              <div>
                <div className="font-semibold">Reputation</div>
                <div>5,640</div>
                <div>2,800</div>
                <div>1,960</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          {/* Reputation Economy */}
          <div className="bg-white/40 dark:bg-slate-800/60 rounded-xl shadow p-6">
            <div className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Reputation Economy</div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-medium mb-1 text-slate-800 dark:text-slate-100">Total Reputation</div>
              <div className="text-3xl font-bold mb-1 text-yellow-500">13,000</div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span>⚡</span>
                <span>azora</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
