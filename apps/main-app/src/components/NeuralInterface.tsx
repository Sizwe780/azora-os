import React, { useState, useEffect } from 'react';

interface NeuralInterfaceProps {
  onIntent: (intent: string) => void;
}

export const NeuralInterface: React.FC<NeuralInterfaceProps> = ({ onIntent }) => {
  const [command, setCommand] = useState('');
  const [workspace, setWorkspace] = useState<any>(null);
  const [geneticStream, setGeneticStream] = useState<string[]>([]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onIntent(command);
      setCommand('');
      // Simulate assembling workspace
      setWorkspace({ type: 'response', content: `Processing: "${command}"` });
    }
  };

  useEffect(() => {
    // Simulate genetic stream updates
    const interval = setInterval(() => {
      const events = [
        'Fusion: Student bounty completed',
        'Chemosynthesis: 1.2M API calls processed',
        'Mycelial: New pod formed',
        'Phoenix: Genome imprint updated'
      ];
      setGeneticStream(prev => [events[Math.floor(Math.random() * events.length)], ...prev.slice(0, 4)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black text-green-400 font-mono">
      {/* Genetic Stream - Ambient Feed */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="text-xs opacity-60 space-y-1">
          {geneticStream.map((event, i) => (
            <div key={i} className="animate-pulse">{event}</div>
          ))}
        </div>
      </div>

      {/* Adaptive Workspace - Main Canvas */}
      <div className="flex-1 p-4 border-t border-green-800">
        {workspace ? (
          <div className="bg-green-900 p-4 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(workspace, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-center opacity-50">
            Adaptive Workspace - Ready for Intent
          </div>
        )}
      </div>

      {/* Command Core - Input */}
      <div className="p-4 border-t border-green-800">
        <form onSubmit={handleCommandSubmit} className="flex">
          <span className="text-green-600 mr-2">&gt;</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-green-400"
            placeholder="State your intent..."
            autoFocus
          />
        </form>
      </div>

      {/* Constitutional Core - Governance Access */}
      <div className="p-2 border-t border-green-800 text-center">
        <button className="text-xs opacity-60 hover:opacity-100">
          🏛️ Constitutional Core
        </button>
      </div>
    </div>
  );
};