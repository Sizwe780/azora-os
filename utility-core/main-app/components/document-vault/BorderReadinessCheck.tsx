import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown } from 'lucide-react';
import { BORDER_POSTS, BorderPost, Document, checkBorderReadiness as apiCheck } from '../../features/document-vault/mockData';

interface BorderReadinessCheckProps {
  documents: Document[];
}

interface ReadinessResult {
  borderPost?: BorderPost;
  ready: boolean;
  missingDocs: string[];
  timestamp: string;
}

const BorderReadinessCheck = ({ documents }: BorderReadinessCheckProps) => {
  const [selectedBorder, setSelectedBorder] = useState(BORDER_POSTS[0].code);
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = () => {
    setIsLoading(true);
    setResult(null);
    setTimeout(() => {
      const readinessResult = apiCheck(documents, selectedBorder);
      setResult(readinessResult);
      setIsLoading(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">Border Readiness Check</h2>
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full relative">
          <label className="text-gray-400 text-sm mb-2 block">Select Border Post</label>
          <select
            value={selectedBorder}
            onChange={(e) => setSelectedBorder(e.target.value)}
            className="w-full appearance-none px-4 py-3 bg-gray-800/60 border border-gray-700/80 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          >
            {BORDER_POSTS.map((border) => (
              <option key={border.code} value={border.code} className="bg-gray-900">{border.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-11 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        <motion.button
          onClick={handleCheck}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          Check Readiness
        </motion.button>
      </div>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          transition={{delay: 0.2}}
          className="mt-6 p-4 bg-gray-800/60 rounded-lg border border-gray-700/50"
        >
          <div className={`flex items-center gap-3 mb-3 ${result.ready ? 'text-green-400' : 'text-yellow-400'}`}>
            {result.ready ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            <span className="font-bold text-lg">{result.ready ? `Ready for ${result.borderPost?.name}!` : 'Missing Documents!'}</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Checked at: {new Date(result.timestamp).toLocaleString()}</p>
          {result.missingDocs.length > 0 && (
            <>
                <p className="text-gray-300 mb-2 text-sm">The following documents are required for this border post:</p>
                <div className="flex flex-wrap gap-2">
                {result.missingDocs.map(docType => (
                    <span key={docType} className="px-3 py-1 bg-red-900/50 text-red-300 text-xs rounded-full capitalize flex items-center gap-1.5 border border-red-500/30">
                    <XCircle size={14} /> {docType.replace(/_/g, ' ')}
                    </span>
                ))}
                </div>
            </>
          )}
           {result.ready && (
            <p className="text-gray-300 text-sm">All required documents are present and verified.</p>
           )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default BorderReadinessCheck;
