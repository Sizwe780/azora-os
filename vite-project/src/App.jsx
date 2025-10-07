import React from "react";

// Glassmorphic animated background beams component
function BeamsBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none select-none">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/30 via-yellow-100/10 to-purple-700/20 blur-2xl" />
      {/* Animated beams */}
      <div className="absolute left-[-10vw] top-[10vh] w-[60vw] h-[30vh] rounded-full bg-yellow-300/25 blur-[100px] animate-azora-beam1" style={{ animationDelay: "0s" }} />
      <div className="absolute right-[-15vw] bottom-[5vh] w-[50vw] h-[24vh] rounded-full bg-cyan-400/20 blur-[80px] animate-azora-beam2" style={{ animationDelay: "2s" }} />
      <div className="absolute left-[30vw] top-[60vh] w-[40vw] h-[16vh] rounded-full bg-purple-500/15 blur-[70px] animate-azora-beam3" style={{ animationDelay: "4s" }} />
      {/* Shimmer line */}
      <div className="absolute left-1/4 top-1/2 w-1/2 h-2 bg-gradient-to-r from-yellow-300/0 via-yellow-200/70 to-yellow-300/0 opacity-40 rounded-xl blur-2xl animate-azora-shimmer" />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
      <BeamsBackground />
      <div className="relative z-10 w-full max-w-2xl p-8 rounded-2xl bg-white/30 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-slate-800/40">
        <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white text-center">
          Azora Intelligent Logistics Console
        </h1>
        <p className="text-center text-lg mb-8 text-slate-600 dark:text-slate-300">
          Welcome to your premium dashboard ✨
        </p>

        {/* Example "profile" card */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-slate-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            D
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">Demo User</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Citizen · <span className="text-green-500">online</span></div>
          </div>
        </div>

        {/* Advisor panel */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-xl p-4 mb-8 shadow border border-white/10">
          <div className="font-medium text-slate-800 dark:text-slate-100 mb-1">Governance Advisor</div>
          <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 text-sm">
            <li>Compliance risk detected in the latest proposal. Review contract terms and improve error handling.</li>
            <li>Federation activity surge. Monitor cross-nation proposals for alignment.</li>
          </ul>
        </div>

        {/* Federation Overview */}
        <div className="bg-white/50 dark:bg-slate-800/60 rounded-xl shadow p-6 mb-8 border border-white/10">
          <div className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Federation Overview</div>
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

        {/* Reputation Economy */}
        <div className="bg-white/50 dark:bg-slate-800/60 rounded-xl shadow p-6 border border-white/10">
          <div className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Reputation Economy</div>
          <div className="flex flex-col items-center">
            <div className="text-lg font-medium mb-1 text-slate-800 dark:text-slate-100">Total Reputation</div>
            <div className="text-3xl font-bold mb-1 text-yellow-500">13,000</div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span>⚡</span>
              <span>azora</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
