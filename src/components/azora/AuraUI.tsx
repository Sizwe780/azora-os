import React, { useState } from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';

export default function AuraUI() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-purple-600 hover:bg-purple-500 backdrop-blur-xl border border-purple-400/30 rounded-full transition-all shadow-lg"
        aria-label="Toggle Aura"
      >
        {isOpen ? <FaTimes className="text-white" /> : <FaRobot className="text-white" />}
      </button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-slate-800/95 backdrop-blur-xl border border-purple-400/30 rounded-lg shadow-2xl p-6">
          <h3 className="text-xl font-bold text-purple-300 mb-2">Aura Guardian</h3>
          <p className="text-sm text-white/70 mb-4">Your AI is watching over you. All systems operational.</p>
          <div className="text-xs text-green-400">● Active and Protecting</div>
        </div>
      )}
    </div>
  );
}
