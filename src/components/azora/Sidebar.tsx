import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaMoneyBillWave, FaAtom, FaMap, FaCog, FaTruck, FaStore, FaSnowflake, FaShieldAlt } from 'react-icons/fa';

const navItems = [
  { path: '/', label: 'Sanctuary', icon: FaHome },
  { path: '/driver', label: 'Driver AI', icon: FaTruck },
  { path: '/woolworths', label: 'Woolworths', icon: FaStore },
  { path: '/coldchain', label: 'Cold Chain', icon: FaSnowflake },
  { path: '/safety', label: 'Safety', icon: FaShieldAlt },
  { path: '/klipp', label: 'Klipp', icon: FaMoneyBillWave },
  { path: '/genesis-chamber', label: 'Genesis', icon: FaAtom },
  { path: '/ledger', label: 'Ledger', icon: FaMap },
  { path: '/settings', label: 'Settings', icon: FaCog },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-4 relative z-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cyan-300">Azora OS</h1>
        <p className="text-sm text-white/60">Infinite Aura</p>
      </div>
      
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
