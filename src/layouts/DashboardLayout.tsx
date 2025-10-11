import * as React from "react";
import Sidebar from "../app/Sidebar";
import BeamsBackground from "../app/BeamsBackground";
import ThemeToggle from "../app/ThemeToggle";
import AuraUI from "../app/AuraUI";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
      {/* Animated background beams */}
      <BeamsBackground />

      {/* Sidebar Navigation */}
      <nav aria-label="Main navigation">
        <Sidebar />
      </nav>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 p-8 flex flex-col gap-8 relative z-10"
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Floating theme toggle and AI command center */}
      <div className="fixed bottom-6 right-6 z-20 flex items-end gap-4" aria-label="Quick actions">
        <AuraUI />
        <ThemeToggle />
      </div>
    </div>
  );
}
