import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, ShieldOff } from 'lucide-react';
import { SecurityLayer } from '../../features/security/mockSecurity';
import { formatDistanceToNow } from 'date-fns';

interface SecurityLayersPanelProps {
  layers: SecurityLayer[];
}

const layerIcon = (status: SecurityLayer['status']) => {
  switch (status) {
    case 'active':
      return <ShieldCheck className="w-5 h-5 text-green-400" />;
    case 'inactive':
      return <ShieldOff className="w-5 h-5 text-gray-500" />;
    case 'error':
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
  }
};

const layerColor = (status: SecurityLayer['status']) => {
  switch (status) {
    case 'active':
      return 'border-green-500/30 bg-green-900/20';
    case 'inactive':
      return 'border-gray-700 bg-gray-800/20';
    case 'error':
      return 'border-red-500/30 bg-red-900/20';
  }
};

const SecurityLayersPanel: React.FC<SecurityLayersPanelProps> = ({ layers }) => {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">5-Layer Security System</h2>
      <div className="space-y-3">
        {layers.map((layer, index) => (
          <motion.div
            key={index}
            className={`p-4 rounded-lg border ${layerColor(layer.status)}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {layerIcon(layer.status)}
                <h3 className="font-bold text-white">Layer {index + 1}: {layer.name}</h3>
              </div>
              <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${
                layer.status === 'active' ? 'bg-green-500/20 text-green-300' :
                layer.status === 'error' ? 'bg-red-500/20 text-red-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {layer.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">{layer.description}</p>
            <div className="text-xs text-gray-500">
              Last check: {formatDistanceToNow(new Date(layer.lastCheck), { addSuffix: true })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SecurityLayersPanel;
