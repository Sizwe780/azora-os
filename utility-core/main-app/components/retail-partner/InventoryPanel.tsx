import React from 'react';
import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';
import { InventoryItem } from '../../features/retail-partner/mockRetail';

interface InventoryPanelProps {
  inventory: InventoryItem[];
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory }) => {
  return (
    <motion.div 
      className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Boxes className="w-7 h-7 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">Smart Inventory</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map(item => (
          <div 
            key={item.sku} 
            className={`p-4 rounded-xl border transition-all ${
              item.stock < item.suggestedReorder * 0.5 
                ? 'bg-red-900/30 border-red-500/40' 
                : 'bg-gray-800/50 border-gray-700/70'
            }`}
          >
            <h3 className="font-bold text-white truncate">{item.name}</h3>
            <p className="text-xs text-gray-400">{item.sku}</p>
            <p className="text-3xl font-bold text-cyan-300 my-2">{item.stock}</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Demand:</span>
              <span className={`font-semibold ${
                item.demand === 'High' ? 'text-red-400' : 
                item.demand === 'Medium' ? 'text-yellow-400' : 'text-green-400'
              }`}>{item.demand}</span>
            </div>
            {item.stock < item.suggestedReorder * 0.5 && (
              <button className="mt-3 w-full py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold text-white transition-colors">
                Reorder Now
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default InventoryPanel;
