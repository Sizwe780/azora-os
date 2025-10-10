import React from 'react';
import { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';

const commands = [
  { cmd: 'get logsheet <tripId>', desc: 'Download a PDF logsheet for a specific trip.' },
  { cmd: 'get invoice <invoiceId>', desc: 'Download a PDF for a specific invoice.' },
  { cmd: 'track driver <driverId>', desc: 'Show live location for a specific driver.' },
  { cmd: 'show insights', desc: 'Display the latest AI-powered operational insights.' },
  { cmd: 'toggle theme', desc: 'Switch between light and dark mode.' },
];

export function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd parse the command and execute it.
    // For example, if inputValue is "get logsheet 123", trigger a download.
    alert(`Executing: ${inputValue}`);
    setInputValue('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-indigo-600/80 text-white rounded-lg backdrop-blur-md shadow-lg hover:bg-indigo-500"
        >
          Cmd+K
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24">
      <GlassCard className="w-full max-w-2xl p-0 overflow-hidden">
        <form onSubmit={handleCommand}>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Enter a command or search..."
            className="w-full bg-transparent text-white text-lg p-4 focus:outline-none"
            autoFocus
          />
        </form>
        <div className="p-4 border-t border-white/10 max-h-96 overflow-y-auto">
          <h3 className="text-sm text-white/50 mb-2">Available Commands</h3>
          <ul className="space-y-2">
            {commands.map(c => (
              <li
                key={c.cmd}
                onClick={() => setInputValue(c.cmd)}
                className="p-2 rounded-md hover:bg-white/10 cursor-pointer"
              >
                <p className="font-mono text-white">{c.cmd}</p>
                <p className="text-sm text-white/60">{c.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </GlassCard>
    </div>
  );
}
