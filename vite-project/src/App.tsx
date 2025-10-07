import React from "react";
import Sidebar from "./components/azora/Sidebar";
import BeamsBackground from "./components/azora/BeamsBackground";
import GlassPanel from "./components/azora/atoms/GlassPanel";

export default function App() {
  return (
    <div className="relative min-h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden flex">
      <BeamsBackground />
      <Sidebar />

      <main className="flex-1 p-8 grid gap-8 md:grid-cols-2 relative z-10">
        <GlassPanel accent="premium" animated>
          <h2 className="text-xl font-bold text-white">User Info</h2>
          <p className="text-white/80">Details about the user go here.</p>
        </GlassPanel>
        <GlassPanel accent="info">
          <h2 className="text-xl font-bold text-white">Advisor</h2>
          <p className="text-white/80">Advisor insights and suggestions.</p>
        </GlassPanel>
        <GlassPanel accent="success">
          <h2 className="text-xl font-bold text-white">Federation Overview</h2>
          <p className="text-white/80">Federation stats and metrics.</p>
        </GlassPanel>
        <GlassPanel accent="cosmic" animated>
          <h2 className="text-xl font-bold text-white">Reputation Economy</h2>
          <p className="text-white/80">Gamified reputation system.</p>
        </GlassPanel>
      </main>
    </div>
  );
}
