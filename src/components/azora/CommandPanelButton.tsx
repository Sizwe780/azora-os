import React from "react";
import { Sparkles } from "lucide-react";

export default function CommandPanelButton() {
  return (
    <button
      className="w-full flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400/40 to-cyan-400/30 text-white font-bold py-2 px-4 shadow-lg hover:scale-105 transition"
      onClick={() => {
        // open command panel/modal
        document.dispatchEvent(new CustomEvent("open-command-panel"));
      }}
    >
      <Sparkles className="text-yellow-200" />
      Azora Command Center
    </button>
  );
}