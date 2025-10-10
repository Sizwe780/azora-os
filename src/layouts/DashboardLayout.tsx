import React from "react";
import Sidebar from "../components/azora/Sidebar";
import BeamsBackground from "../components/azora/BeamsBackground";
import ThemeToggle from "../components/azora/ThemeToggle";
import AuraUI from "../components/azora/AuraUI";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
      {/* Animated background beams */}
      <BeamsBackground />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-8 flex flex-col gap-8 relative z-10">
        {children}
      </main>

      {/* Floating theme toggle and AI command center */}
      <div className="fixed bottom-6 right-6 z-20 flex items-end gap-4">
        <AuraUI />
        <ThemeToggle />
      </div>
    </div>
  );
}
