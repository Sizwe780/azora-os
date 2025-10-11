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
      <nav aria-label="Main navigation" className="hidden lg:block">
        <Sidebar />
      </nav>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 px-4 py-6 md:p-6 lg:p-8 flex flex-col relative z-10 overflow-y-auto max-w-[100vw]"
        role="main"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Floating theme toggle and AI command center */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-20 flex items-end gap-2 md:gap-4" aria-label="Quick actions">
        <AuraUI />
        <ThemeToggle />
      </div>
    </div>
  );
}
