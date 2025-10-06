import React, { useEffect, useState } from "react";
import GlassPanel from "./atoms/GlassPanel";
import { X } from "lucide-react";
import Lottie from "lottie-react";
import commandLottie from "../../assets/command-center.json"; // Add your Lottie JSON for command center

const features = [
  { title: "Quick Actions", desc: "Fast access to create jobs, pay partners, or onboard drivers." },
  { title: "Premium Analytics", desc: "See advanced stats and business insights." },
  { title: "Settings", desc: "Personalize your experience and manage integrations." },
  { title: "Support", desc: "Get help or contact Azora premium support." },
  // ...add more features as needed
];

export default function CommandCenter() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("open-command-panel", openHandler as EventListener);
    return () => window.removeEventListener("open-command-panel", openHandler as EventListener);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <GlassPanel accent="premium" className="relative max-w-xl w-full p-6 animate-float">
        <button onClick={() => setOpen(false)} className="absolute top-5 right-5 text-yellow-400 hover:text-white transition">
          <X size={28} />
        </button>
        <div className="flex items-center mb-6">
          <Lottie animationData={commandLottie} style={{ width: 80, height: 80 }} />
          <div className="ml-4">
            <h2 className="text-2xl font-extrabold text-yellow-300 mb-1">Azora Command Center</h2>
            <p className="text-white/70">All your power functions, in one place.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-lg bg-white/10 p-4 shadow border border-yellow-200/20 text-white">
              <div className="font-bold text-yellow-200 mb-1">{f.title}</div>
              <div className="text-white/80">{f.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-sm text-yellow-300/80 text-center">Upgrade to Premium for more features</div>
      </GlassPanel>
    </div>
  );
}