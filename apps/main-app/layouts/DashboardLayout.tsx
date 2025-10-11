import * as React from "react";
import Sidebar from "../components/azora/Sidebar";
import BeamsBackground from "../app/BeamsBackground";
import ThemeToggle from "../app/ThemeToggle";
import AuraUI from "../app/AuraUI";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Animated background beams */}
      <BeamsBackground />

      {/* Sidebar Navigation */}
      <nav aria-label="Main navigation">
        <Sidebar />
      </nav>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 p-8 flex flex-col gap-6 relative z-10 overflow-y-auto"
        role="main"
        tabIndex={-1}
      >
        <div className="max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Floating theme toggle and AI command center */}
      <div className="fixed bottom-6 right-6 z-20 flex items-end gap-4" aria-label="Quick actions">
        <AuraUI />
        <ThemeToggle />
      </div>
    </div>
  );
}
