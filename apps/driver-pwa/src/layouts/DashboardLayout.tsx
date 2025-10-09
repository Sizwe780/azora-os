import React from "react";
import Sidebar from "../components/Sidebar";
import BeamsBackground from "../components/BeamsBackground";
import ThemeToggle from "../components/ThemeToggle";

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

      {/* Floating theme toggle */}
      <div className="fixed bottom-6 right-6 z-20">
        <ThemeToggle />
      </div>
    </div>
  );
}
