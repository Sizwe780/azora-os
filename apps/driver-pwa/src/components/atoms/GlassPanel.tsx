import React from "react";
import clsx from "clsx";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  accent?: "premium" | "";
  animated?: boolean;
}

export default function GlassPanel({
  children,
  className = "",
  accent = "",
  animated = false,
}: GlassPanelProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl shadow-xl overflow-hidden",
        "backdrop-blur-lg bg-white/30 dark:bg-slate-900/40",
        "border border-white/20 dark:border-slate-800/40",
        accent === "premium" && "border-2 border-yellow-400/40",
        animated && "animate-float",
        className
      )}
      style={{
        boxShadow:
          accent === "premium"
            ? "0 8px 40px 0 rgba(255, 215, 0, 0.13), 0 2px 12px 0 rgba(0,0,0,0.23)"
            : undefined,
      }}
    >
      {children}
    </div>
  );
}
