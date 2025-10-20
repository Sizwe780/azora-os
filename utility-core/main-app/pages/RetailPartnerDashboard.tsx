import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, BrainCircuit, AlertTriangle, Users, DollarSign, HeartPulse } from 'lucide-react';

import { RetailData, getMockRetailData } from '../features/retail-partner/mockRetail';
import MetricCard from '../components/retail-partner/MetricCard';
import InventoryPanel from '../components/retail-partner/InventoryPanel';
import CustomerFlowPanel from '../components/retail-partner/CustomerFlowPanel';
import WellnessPanel from '../components/retail-partner/WellnessPanel';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function RetailPartnerDashboard() {
  const [data, setData] = useState<RetailData | null>(null);

  useEffect(() => {
    // In a real app, you'd fetch this data. Here we use mock data.
    const retailData = getMockRetailData();
    setData(retailData);
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-full"><BrainCircuit className="w-16 h-16 text-purple-400 animate-pulse" /></div>;
  }

  const lowStockItemsCount = data.inventory.filter(item => item.stock < item.suggestedReorder * 0.5).length;
  const nextHourFlow = data.customerFlow[0]?.predictedCustomers || 0;

  return (
    <motion.div 
      className="p-6 bg-gray-950 text-white space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-4">
          <ShoppingCart className="w-10 h-10 text-cyan-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Retail Partner Elite</h1>
            <p className="text-cyan-300">AI-Powered Operations Control Center</p>
          </div>
        </div>
      </motion.div>

      {/* AI Insight */}
      <motion.div 
        className="bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6 text-center"
        variants={itemVariants}
      >
        <BrainCircuit className="w-10 h-10 text-purple-400 mx-auto mb-3 animate-pulse" />
        <h3 className="text-xl font-bold text-white mb-2">Aura's Strategic Insight</h3>
        <p className="text-lg text-purple-300 max-w-4xl mx-auto">{data.aiInsight}</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <MetricCard icon={AlertTriangle} label="Low Stock Items" value={lowStockItemsCount} color="red" />
        <MetricCard icon={Users} label="Customers (Next Hr)" value={nextHourFlow} color="blue" />
        <MetricCard icon={DollarSign} label="Revenue Today" value={`$${(data.revenueToday / 1000).toFixed(1)}k`} color="green" />
        <MetricCard icon={HeartPulse} label="Avg. Fatigue Score" value={data.wellness.averageFatigue.toFixed(0)} color="yellow" />
      </motion.div>

      {/* Panels */}
      <InventoryPanel inventory={data.inventory} />
      <CustomerFlowPanel customerFlow={data.customerFlow} />
      <WellnessPanel wellness={data.wellness} />

    </motion.div>
  );
}
