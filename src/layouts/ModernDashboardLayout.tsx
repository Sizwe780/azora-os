import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { GlassCard } from '../components/ui/GlassCard';
import BeamsBackground from '../app/BeamsBackground';

const sidebarOptions = [
  { label: 'Dashboard', icon: '🏠', href: '#dashboard' },
  { label: 'Analytics', icon: '📊', href: '#analytics' },
  { label: 'Drones', icon: '🚁', href: '/drones' },
  { label: 'Ledger', icon: '🧾', href: '/ledger' },
  { label: 'Reputation', icon: '💎', href: '#reputation' },
  { label: 'Azora Suite', icon: '🧰', href: '#suite' },
  { label: 'Logout', icon: '🚪', href: '/login' },
];

const suiteFeatures = [
    {
        title: 'Quantum-Enhanced Logistics',
        description: 'Optimize routes and schedules with quantum algorithms for unparalleled efficiency.',
    },
    {
        title: 'Ontological Digital Twin',
        description: 'Create a secure, verifiable digital identity for any asset, person, or process.',
    },
    {
        title: 'Neural Intent Prediction',
        description: 'Anticipate operational needs and risks with predictive AI that understands user intent.',
    },
    {
        title: 'AI-Powered Ledger Analysis',
        description: 'Automatically audit and find insights in complex operational and financial records.',
    },
    {
        title: 'Sovereign Voice Copilot',
        description: 'Control the entire OS with your voice, ensuring data privacy and security.',
    },
    {
        title: 'Federated Identity & Auth',
        description: 'Seamlessly integrate with existing identity providers while maintaining sovereign control.',
    },
];

export function ModernDashboardLayout({ children }: { children: React.ReactNode }) {
  const [activePanel, setActivePanel] = useState('Dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('azora-auth');
    navigate('/login');
  };

  const handleNavigation = (href: string) => {
    if (href === '/login') {
      handleLogout();
    } else if (href === '#suite') {
      setActivePanel('Azora Suite');
    } else if (href.startsWith('/')) {
      navigate(href);
    }
    else {
      setActivePanel('Dashboard');
    }
  };

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-slate-900 via-indigo-950 to-black text-white overflow-hidden">
      <BeamsBackground />
      <aside className="fixed top-0 left-0 h-full w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-2xl z-30 flex flex-col items-center py-8">
        <img src="/azora-logo.svg" alt="Azora OS" className="w-16 mb-8 drop-shadow-lg" />
        <nav className="flex flex-col gap-4 w-full px-6">
          {sidebarOptions.map(opt => (
            <button
              key={opt.label}
              onClick={() => handleNavigation(opt.href)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-600/30 transition-all text-lg font-semibold ${activePanel === opt.label ? 'bg-indigo-600/30' : ''}`}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </nav>
        <div className="flex-grow" />
        <ThemeToggle />
      </aside>
      <main className="flex-1 ml-64 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-indigo-900/10 to-black/30 pointer-events-none" style={{ filter: 'blur(12px)' }} />
        <div className="relative z-10 p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activePanel === 'Azora Suite' ? (
            <div className="col-span-3">
              <div className="mb-8 text-3xl font-extrabold text-yellow-300">Azora Suite: Super Advanced Features</div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {suiteFeatures.map(f => (
                  <div key={f.title} className="glass p-6 rounded-2xl shadow-xl border border-yellow-400/30">
                    <div className="text-xl font-bold text-indigo-300 mb-2">{f.title}</div>
                    <div className="text-white/80 text-sm">{f.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
