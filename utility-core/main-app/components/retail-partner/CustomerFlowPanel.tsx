import React from 'react';
import { motion } from 'framer-motion';
import { LineChart } from 'lucide-react';
import { CustomerFlowPoint } from '../../features/retail-partner/mockRetail';

interface CustomerFlowPanelProps {
  customerFlow: CustomerFlowPoint[];
}

const CustomerFlowPanel: React.FC<CustomerFlowPanelProps> = ({ customerFlow }) => {
  return (
    <motion.div 
      className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
      <div className="flex items-center gap-3 mb-4">
        <LineChart className="w-7 h-7 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Customer Flow Forecast</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6">
        {customerFlow.map((flow, idx) => (
          <div 
            key={idx} 
            className="min-w-[90px] flex-shrink-0 p-4 bg-gray-800/70 border border-gray-700 rounded-xl text-center"
          >
            <p className="text-sm text-gray-400">{flow.hour}:00</p>
            <p className="text-3xl font-bold text-purple-300 my-1">{flow.predictedCustomers}</p>
            <p className="text-xs text-gray-500">people</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CustomerFlowPanel;
