import React from "react";
import GlassPanel from "../components/azora/atoms/GlassPanel";

export default function DashboardPage() {
  return (
    <GlassPanel animated accent="premium" className="w-full max-w-3xl mb-8">
      <h1 className="text-4xl font-extrabold text-yellow-300 mb-2">Azora Intelligent Logistics Console</h1>
      <p className="text-lg text-white/70">Welcome to your premium dashboard ✨</p>
      {/* Add your widgets here, each in a <GlassPanel> */}
    </GlassPanel>
  );
}