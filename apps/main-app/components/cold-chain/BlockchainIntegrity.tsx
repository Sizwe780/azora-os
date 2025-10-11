import React from 'react';
import { motion } from 'framer-motion';
import { Link, CheckCircle, XCircle } from 'lucide-react';
import { BlockchainData } from '../../features/cold-chain/mockColdChainData';

const BlockchainIntegrity: React.FC<{ data: BlockchainData }> = ({ data }) => {
  const isVerified = data.status === 'VERIFIED';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Link className="w-5 h-5 text-purple-400" />
        Blockchain Integrity
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Chain Status</span>
          <span className={`font-bold flex items-center gap-1 ${isVerified ? 'text-green-400' : 'text-red-400'}`}>
            {isVerified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {data.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Blocks</span>
          <span className="font-bold text-white font-mono">{data.totalBlocks.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Chain Integrity</span>
          <span className="font-bold text-green-400 font-mono">{data.integrityPercentage}%</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-gray-400">Last Block Hash</span>
            <span className="font-mono text-xs text-purple-300 truncate ml-4">{data.lastBlockHash}</span>
        </div>
      </div>
      <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-purple-500/20">
        View Full Chain
      </button>
    </motion.div>
  );
};

export default BlockchainIntegrity;
