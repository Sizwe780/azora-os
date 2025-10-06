import React from "react";
import Sidebar from "../components/azora/Sidebar";
import BeamsBackground from "../components/azora/BeamsBackground";
import ThemeToggle from "../components/azora/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900 relative">
      <BeamsBackground />
      <ThemeToggle />
      <Sidebar />
      <main className="flex-1 p-8 flex flex-col gap-8 items-center">{children}</main>
    </div>
  );
}