import React from 'react';
import { LogOut, Settings, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-gray-900/50 px-4 backdrop-blur-lg sm:px-6">
      <div>
        {/* Breadcrumbs or Page Title can go here */}
        <h1 className="text-lg font-semibold text-white">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-white/70 hover:text-white">
          <Settings size={20} />
        </button>
        <button className="text-white/70 hover:text-white">
          <User size={20} />
        </button>
        <button className="text-white/70 hover:text-white">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
