import React from 'react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import BeamsBackground from '../components/azora/BeamsBackground';

const sidebarOptions = [
  { label: 'Dashboard', icon: '🏠', href: '#dashboard' },
  { label: 'Governance', icon: '🗳️', href: '#governance' },
  { label: 'Constitution', icon: '📜', href: '#constitution' },
  { label: 'Federation', icon: '🌐', href: '#federation' },
  { label: 'Reputation', icon: '💎', href: '#reputation' },
  { label: 'Azora Suite', icon: '🧰', href: '#suite' },
];

export function ModernDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-slate-900 via-indigo-950 to-black text-white overflow-hidden">
      <BeamsBackground />
      <aside className="fixed top-0 left-0 h-full w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-2xl z-30 flex flex-col items-center py-8">
        <img src="/azora-logo.svg" alt="Azora OS" className="w-16 mb-8 drop-shadow-lg" />
        <nav className="flex flex-col gap-4 w-full px-6">
          {sidebarOptions.map(opt => (
            <a key={opt.label} href={opt.href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-600/30 transition-all text-lg font-semibold">
              <span className="text-2xl">{opt.icon}</span>
              <span>{opt.label}</span>
            </a>
          ))}
        </nav>
        <div className="flex-grow" />
        <ThemeToggle />
      </aside>
      <main className="flex-1 ml-64 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-indigo-900/10 to-black/30 pointer-events-none" style={{ filter: 'blur(12px)' }} />
        <div className="relative z-10 p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {children}
        </div>
      </main>
    </div>
  );
}
