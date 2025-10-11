import React from 'react';
import { motion } from 'framer-motion';
import { ColdChainAsset } from '../../features/cold-chain/mockColdChainData';
import { formatDistanceToNow } from 'date-fns';

interface AssetSelectorProps {
  assets: ColdChainAsset[];
  selectedAsset: ColdChainAsset;
  onSelectAsset: (asset: ColdChainAsset) => void;
}

const STATUS_STYLES = {
  Optimal: { text: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-900/30' },
  Warning: { text: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-900/30' },
  Critical: { text: 'text-red-400', border: 'border-red-500', bg: 'bg-red-900/30' },
};

const AssetCard: React.FC<{ asset: ColdChainAsset; isSelected: boolean; onSelect: () => void }> = ({ asset, isSelected, onSelect }) => {
  const statusStyle = STATUS_STYLES[asset.status];

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 text-left transition-all w-full h-full flex flex-col justify-between ${
        isSelected ? `${statusStyle.border} ${statusStyle.bg}` : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
      }`}
    >
      <div>
        <p className="font-semibold text-white truncate">{asset.name}</p>
        <p className="text-xs text-gray-400">{asset.location}</p>
      </div>
      <div className="mt-2">
        <p className={`text-3xl font-bold ${statusStyle.text}`}>{asset.currentTemp.toFixed(1)}°C</p>
        <p className="text-xs text-gray-500">
          Synced {formatDistanceToNow(new Date(asset.lastSync), { addSuffix: true })}
        </p>
      </div>
    </motion.button>
  );
};

const AssetSelector: React.FC<AssetSelectorProps> = ({ assets, selectedAsset, onSelectAsset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">Asset Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            isSelected={selectedAsset.id === asset.id}
            onSelect={() => onSelectAsset(asset)}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default AssetSelector;
