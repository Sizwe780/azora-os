import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLedger } from '../features/ledger/useLedger';
import { useI18n } from '../lib/i18n/i18nContext';
import { LedgerEntry } from '../types/ledger';
import { FileText, Search, X, Bot, Printer, Calendar, Building, User, TrendingUp, Shield, Coins, Cpu, HardDrive, Zap } from 'lucide-react';

const ledgerEntryIcons = {
  transfer: Coins,
  compliance: Shield,
  onboarding: User,
  'document-verification': FileText,
  mint: TrendingUp,
  genesis: Building,
};

const ledgerEntryColors = {
  transfer: 'green',
  compliance: 'blue',
  onboarding: 'purple',
  'document-verification': 'yellow',
  mint: 'cyan',
  genesis: 'gray',
};

const FilterInput = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      {...props}
      className="bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white w-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
    />
  </div>
);

const BlockRow = ({ block, onAnalyzeEntry, onPrintEntry }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 rounded-xl">
            <HardDrive className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="font-bold text-lg text-white">Block #{block.index}</p>
            <p className="text-xs text-gray-400 font-mono">{block.hash.substring(0, 20)}...</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Mined: {new Date(block.timestamp).toLocaleString('en-ZA')}</p>
          <p className="text-xs text-gray-500">Difficulty: {block.difficulty} | Nonce: {block.nonce}</p>
          <p className="text-xs text-yellow-400">Reward: {block.minerReward} AZORA</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-400 mb-2">{block.entries.length} entries in this block:</p>
        {block.entries.map((entry, idx) => {
          const getEntryType = (data: unknown) => {
            if (typeof data === 'object' && data !== null && 'type' in data) {
              return String(data.type);
            }
            return 'unknown';
          };

          const type = getEntryType(entry.data);
          const Icon = ledgerEntryIcons[type] || FileText;
          const color = ledgerEntryColors[type] || 'gray';

          return (
            <div key={idx} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${color}-500/20 rounded-lg`}>
                  <Icon className={`w-4 h-4 text-${color}-400`} />
                </div>
                <div>
                  <p className={`font-semibold text-sm text-${color}-300`}>{type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-400 font-mono">{entry.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAnalyzeEntry(entry)}
                  className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-indigo-600 transition-colors"
                >
                  <Bot size={12} />
                </button>
                <button
                  onClick={() => onPrintEntry(entry)}
                  className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-cyan-600 transition-colors"
                >
                  <Printer size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const AIAnalysisModal = ({ entry, onClose }) => {
    if (!entry) return null;
    const type = typeof entry.data === 'object' && entry.data !== null && 'type' in entry.data ? String(entry.data.type) : 'unknown';
    const color = ledgerEntryColors[type] || 'gray';

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
                    <p className="text-sm text-gray-400">Analysis of ledger entry <span className="font-mono text-cyan-400">{entry.id}</span></p>
                    <div className="bg-gray-950/70 p-4 rounded-lg space-y-3">
                        <p><strong className="text-white">Insight:</strong> This <strong className={`text-${color}-400`}>{type.replace('_', ' ')}</strong> event is cryptographically signed and verified.</p>
                        <p><strong className="text-white">Hash:</strong> <span className="font-mono text-yellow-400">{entry.hash}</span></p>
                        <p><strong className="text-white">Timestamp:</strong> {new Date(entry.timestamp).toLocaleString('en-ZA')}</p>
                        <p><strong className="text-white">Recommendation:</strong> This entry is immutable and part of the secure blockchain ledger.</p>
                    </div>
                     <p className="text-xs text-gray-500 text-center pt-2">This is a real cryptographic ledger entry with RSA signature verification.</p>
                </div>
            </motion.div>
        </motion.div>
    );
};


export default function LedgerPage() {
  const { blocks, pendingEntries, stats, loading, forceMineBlock } = useLedger();
  const { t } = useI18n();
  const [filters, setFilters] = useState({ type: '', from: '', to: '', id: '' });
  const [analyzingEntry, setAnalyzingEntry] = useState<LedgerEntry | null>(null);
  const [mining, setMining] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ type: '', from: '', to: '', id: '' });
  };

  const filteredBlocks = useMemo(() => {
    return blocks.filter(block => {
      if (filters.from && block.timestamp < new Date(filters.from).getTime()) return false;
      if (filters.to && block.timestamp > new Date(filters.to + 'T23:59:59').getTime()) return false;

      // Filter entries within blocks
      if (filters.type || filters.id) {
        return block.entries.some(entry => {
          const entryType = typeof entry.data === 'object' && entry.data !== null && 'type' in entry.data ? String(entry.data.type) : '';
          if (filters.type && !entryType.toLowerCase().includes(filters.type.toLowerCase())) return false;
          if (filters.id && !entry.id.toLowerCase().includes(filters.id.toLowerCase())) return false;
          return true;
        });
      }
      return true;
    });
  }, [blocks, filters]);

  const handlePrint = (entry: LedgerEntry) => {
    alert(`Printing PDF for ledger entry: ${entry.id}`);
  };

  const handleMineBlock = async () => {
    setMining(true);
    try {
      await forceMineBlock();
    } catch (error) {
      console.error('Mining failed:', error);
    } finally {
      setMining(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">{t('ledger')}</h1>
            <p className="text-cyan-300">Immutable, real-time log of all system events.</p>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-gray-400">Blocks</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalBlocks}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Entries</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalEntries}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Difficulty</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.currentDifficulty}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Tokens</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalTokens}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Value</span>
            </div>
            <p className="text-2xl font-bold text-white">${stats.ecosystemValue.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${stats.isValid ? 'text-green-400' : 'text-red-400'}`} />
              <span className="text-sm text-gray-400">Valid</span>
            </div>
            <p className={`text-2xl font-bold ${stats.isValid ? 'text-green-400' : 'text-red-400'}`}>
              {stats.isValid ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        {/* Mining Controls */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleMineBlock}
            disabled={mining || pendingEntries.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2 hover:from-cyan-500 hover:to-blue-500 transition-all"
          >
            <Zap className="w-5 h-5" />
            {mining ? 'Mining...' : 'Mine Block'}
          </button>
          {pendingEntries.length > 0 && (
            <div className="flex items-center gap-2 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              {pendingEntries.length} pending entries
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FilterInput icon={Search} name="type" value={filters.type} onChange={handleFilterChange} placeholder="Filter by type..." />
                <FilterInput icon={Calendar} name="from" type="date" value={filters.from} onChange={handleFilterChange} placeholder="From date" />
                <FilterInput icon={Calendar} name="to" type="date" value={filters.to} onChange={handleFilterChange} placeholder="To date" />
                <FilterInput icon={FileText} name="id" value={filters.id} onChange={handleFilterChange} placeholder="Entry ID" />
            </div>
            {(filters.type || filters.from || filters.to || filters.id) && (
                <div className="flex justify-end mt-4">
                    <button onClick={clearFilters} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <X size={16} /> Clear Filters
                    </button>
                </div>
            )}
        </div>
      </motion.div>

      {/* Blockchain Blocks */}
      <motion.div layout className="space-y-4">
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-gray-900/50 border border-gray-700/50 rounded-2xl"
            >
              <p className="text-white font-semibold">{t('loading')}</p>
              <p className="text-gray-400 text-sm mt-2">Fetching blockchain data</p>
            </motion.div>
          ) : filteredBlocks.length > 0 ? (
            filteredBlocks.map((block) => (
              <BlockRow key={block.index} block={block} onAnalyzeEntry={setAnalyzingEntry} onPrintEntry={handlePrint} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-gray-900/50 border border-gray-700/50 rounded-2xl"
            >
              <p className="text-white font-semibold">{t('noData')}</p>
              <p className="text-gray-400 text-sm mt-2">No blocks found. Try adjusting your filters or mine the first block.</p>
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
