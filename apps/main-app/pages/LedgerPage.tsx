import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMockLedgerEntries, ledgerEntryIcons, ledgerEntryColors, LedgerEntry } from '../features/ledger/mockLedger';
import { FileText, Search, X, Bot, Printer, Calendar, Building, User } from 'lucide-react';

const FilterInput = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      {...props}
      className="bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
    />
  </div>
);

const LedgerRow = ({ entry, onAnalyze, onPrint }) => {
  const Icon = ledgerEntryIcons[entry.type];
  const color = ledgerEntryColors[entry.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-cyan-500/50 transition-colors"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <div>
          <p className={`font-bold text-sm text-${color}-300`}>{entry.type.replace('_', ' ')}</p>
          <p className="text-xs text-gray-400 font-mono" title={entry.uid}>{entry.uid.substring(0, 15)}...</p>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-white font-semibold" title={entry.entityId}>{entry.entityId}</p>
        <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString('en-ZA')}</p>
      </div>
      <div className="flex-1 text-xs font-mono text-gray-400 hidden lg:block">
        {Object.entries(entry.relatedIds).map(([key, value]) => (
          <p key={key}><span className="font-semibold text-gray-500">{key}: </span>{String(value)}</p>
        ))}
      </div>
      <div className="flex items-center gap-2 justify-end pt-4 md:pt-0 border-t border-gray-800 md:border-none">
        <button
          onClick={() => onAnalyze(entry)}
          className="px-3 py-2 bg-gray-800 text-white rounded-lg text-xs hover:bg-indigo-600 transition-colors flex items-center gap-2"
        >
          <Bot size={14} /> AI
        </button>
        <button
          onClick={() => onPrint(entry)}
          className="px-3 py-2 bg-gray-800 text-white rounded-lg text-xs hover:bg-cyan-600 transition-colors flex items-center gap-2"
        >
          <Printer size={14} /> Print
        </button>
      </div>
    </motion.div>
  );
};

const AIAnalysisModal = ({ entry, onClose }) => {
    if (!entry) return null;
    const color = ledgerEntryColors[entry.type];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`bg-gray-900 border border-${color}-500/50 rounded-2xl w-full max-w-2xl shadow-2xl shadow-${color}-500/10`}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Bot className={`w-6 h-6 text-${color}-400`} />
                        <h2 className="text-xl font-bold text-white">AI Ledger Analysis</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-400">Analysis of ledger entry <span className="font-mono text-cyan-400">{entry.uid}</span></p>
                    <div className="bg-gray-950/70 p-4 rounded-lg space-y-3">
                        <p><strong className="text-white">Insight:</strong> This <strong className={`text-${color}-400`}>{entry.type.replace('_', ' ')}</strong> event appears nominal.</p>
                        <p><strong className="text-white">Context:</strong> The payload indicates a value of <span className="font-mono text-yellow-400">{JSON.stringify(entry.payload)}</span>.</p>
                        <p><strong className="text-white">Recommendation:</strong> No action required. This transaction is consistent with typical patterns for entity <span className="font-mono text-purple-400">{entry.entityId}</span>.</p>
                    </div>
                     <p className="text-xs text-gray-500 text-center pt-2">This is a simulated AI analysis for demonstration purposes.</p>
                </div>
            </motion.div>
        </motion.div>
    );
};


export default function LedgerPage() {
  const [filters, setFilters] = useState({ type: '', from: '', to: '', companyId: '', driverId: '' });
  const [analyzingEntry, setAnalyzingEntry] = useState<LedgerEntry | null>(null);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ type: '', from: '', to: '', companyId: '', driverId: '' });
  };

  const filteredEntries = useMemo(() => {
    return getMockLedgerEntries(filters);
  }, [filters]);

  const handlePrint = (entry: LedgerEntry) => {
    alert(`Printing PDF for ledger entry: ${entry.uid}`);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Sovereign Ledger</h1>
            <p className="text-cyan-300">Immutable, real-time log of all system events.</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <FilterInput icon={Search} name="type" value={filters.type} onChange={handleFilterChange} placeholder="Filter by type..." />
                <FilterInput icon={Calendar} name="from" type="date" value={filters.from} onChange={handleFilterChange} placeholder="From date" />
                <FilterInput icon={Calendar} name="to" type="date" value={filters.to} onChange={handleFilterChange} placeholder="To date" />
                <FilterInput icon={Building} name="companyId" value={filters.companyId} onChange={handleFilterChange} placeholder="Company ID" />
                <FilterInput icon={User} name="driverId" value={filters.driverId} onChange={handleFilterChange} placeholder="Driver ID" />
            </div>
            {(filters.type || filters.from || filters.to || filters.companyId || filters.driverId) && (
                <div className="flex justify-end mt-4">
                    <button onClick={clearFilters} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <X size={16} /> Clear Filters
                    </button>
                </div>
            )}
        </div>
      </motion.div>

      {/* Ledger Entries */}
      <motion.div layout className="space-y-4">
        <AnimatePresence>
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <LedgerRow key={entry.uid} entry={entry} onAnalyze={setAnalyzingEntry} onPrint={handlePrint} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-gray-900/50 border border-gray-700/50 rounded-2xl"
            >
              <p className="text-white font-semibold">No ledger entries found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <AnimatePresence>
        {analyzingEntry && <AIAnalysisModal entry={analyzingEntry} onClose={() => setAnalyzingEntry(null)} />}
      </AnimatePresence>
    </div>
  );
}
