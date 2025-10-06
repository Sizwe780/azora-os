import React, { useState } from 'react';
import { Zap, Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import GlassPanel from './atoms/GlassPanel';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Ledger', href: '/ledger' },
  { label: 'Contracts', href: '/contracts' },
  { label: 'Profile', href: '/profile' },
  { label: 'Nation', href: '/nation' },
  { label: 'Federation', href: '/federation' },
  { label: 'Advisor', href: '/advisor' },
  { label: 'Dispatch', href: '/dispatch' },
  { label: 'Drivers', href: '/drivers' },
  { label: 'Subscription', href: '/subscription' },
  { label: 'Partners', href: '/partners' },
  { label: 'Billing', href: '/billing' },
  { label: 'Settings', href: '/settings' }
];

const Sidebar = ({ isOpen = false }: { isOpen?: boolean }) => {
  const [open, setOpen] = useState(isOpen);
  return (
    <>
      <button className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded bg-cyan-600 text-white" onClick={() => setOpen(!open)}>
        <Menu className="w-6 h-6" />
      </button>
      <div className={`fixed lg:relative top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <GlassPanel className="w-64 h-full flex-shrink-0 p-5 flex flex-col">
          <div className="flex items-center mb-6">
            <Zap className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white ml-2">Azora</h1>
          </div>
          <nav className="flex flex-col gap-2 text-white/80">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) => `p-2 rounded-lg transition-colors ${isActive ? 'bg-cyan-600 text-white' : 'hover:bg-white/10'}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex items-center justify-between">
            <p className="text-xs text-white/40">AzoraOS v2.3-atomic</p>
            <ThemeToggle />
          </div>
        </GlassPanel>
      </div>
    </>
  );
};

export default Sidebar;
export { Sidebar };
