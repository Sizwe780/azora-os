import React from 'react';
import { Zap } from 'lucide-react';
import GlassPanel from './GlassPanel.jsx';

const Sidebar = ({ isOpen }) => (
    <div className={`absolute lg:relative z-20 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <GlassPanel className="w-64 h-full flex-shrink-0 p-5 flex flex-col">
            <div className="flex items-center mb-10">
                <Zap className="w-8 h-8 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white ml-2">Azora</h1>
            </div>
            <nav className="flex flex-col gap-4 text-white/80">
                {['Dashboard', 'Ledger', 'Contracts', 'Profile', 'Nation'].map(item => (
                    <a href="#" key={item} className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">{item}</a>
                ))}
            </nav>
            <div className="mt-auto"><p className="text-xs text-white/40">AzoraOS v2.3-atomic</p></div>
        </GlassPanel>
    </div>
);

export default Sidebar;