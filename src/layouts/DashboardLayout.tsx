import React from 'react';
import Sidebar from '../components/azora/Sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-950 to-black text-white">
      <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide">Azora OS</h1>
        <nav className="flex gap-4 text-sm text-white/70">
          <a href="#governance" className="hover:text-white">Governance</a>
          <a href="#constitution" className="hover:text-white">Constitution</a>
          <a href="#federation" className="hover:text-white">Federation</a>
          <a href="#reputation" className="hover:text-white">Reputation</a>
        </nav>
      </header>
      <div className="flex flex-1">
        <Sidebar isOpen={true} />
        <main className="flex-1 p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children}
        </main>
      </div>
      <footer className="px-6 py-4 border-t border-white/10 text-xs text-white/50">
        © {new Date().getFullYear()} Azora Nation — Sovereign in Code
      </footer>
    </div>
  );
}