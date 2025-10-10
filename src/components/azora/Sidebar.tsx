import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaMoneyBillWave, FaAtom, FaMap, FaCog, FaTruck, FaStore, FaSnowflake, FaShieldAlt } from 'react-icons/fa';
import { Navigation, Brain, Zap } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Sanctuary', icon: FaHome },
  { path: '/driver', label: 'Driver AI', icon: FaTruck },
  { path: '/ai', label: 'Quantum AI', icon: Brain, highlight: true, newFeature: true },
  { path: '/evolution', label: 'AI Evolution 🇿🇦', icon: Zap, highlight: true, newFeature: true, saMarket: true },
  { path: '/tracking', label: 'Quantum Track', icon: Navigation, highlight: true },
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
                  ? item.highlight 
                    ? item.saMarket
                      ? 'bg-gradient-to-r from-green-600 via-yellow-600 to-green-600 text-white shadow-lg shadow-green-500/50'
                      : item.newFeature
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/50'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-cyan-600 text-white'
                  : item.highlight
                    ? item.saMarket
                      ? 'text-white bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-green-500/20 hover:from-green-500/30 hover:via-yellow-500/30 hover:to-green-500/30 border border-green-500/40'
                      : item.newFeature
                      ? 'text-white bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 hover:from-purple-500/30 hover:via-pink-500/30 hover:to-purple-500/30 border border-pink-500/40'
                      : 'text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-purple-500/30'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={item.highlight ? 'animate-pulse' : ''} />
              <span>{item.label}</span>
              {item.highlight && !isActive && (
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                  item.saMarket
                    ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white animate-pulse'
                    : item.newFeature 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse'
                    : 'bg-purple-500 text-white'
                }`}>
                  {item.saMarket ? '🚀 NEW' : item.newFeature ? '🧠 NEW' : 'NEW'}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
