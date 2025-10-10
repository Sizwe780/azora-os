import React from 'react';
// src/pages/WoolworthsDashboard.tsx
/**
 * WOOLWORTHS ELITE DASHBOARD
 * 
 * Complete integration with Woolworths operations.
 * AI-powered inventory management, customer flow prediction,
 * dynamic pricing, and employee wellness monitoring.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { GlassCard } from '../components/ui/GlassCard';
import { 
  FaBoxes, FaUsers, FaDollarSign, FaHeart, 
  FaChartLine, FaExclamationTriangle, FaBrain 
} from 'react-icons/fa';

type InventoryItem = {
  sku: string;
  stock: number;
  demand: string;
  suggestedReorder: number;
};

type WellnessData = {
  totalEmployees: number;
  highFatigueCount: number;
  averageFatigue: number;
  recommendation: string;
};

export default function WoolworthsDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customerFlow, setCustomerFlow] = useState<any[]>([]);
  const [wellness, setWellness] = useState<WellnessData | null>(null);
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch inventory
      const invRes = await axios.get('/api/woolworths/inventory');
      setInventory(invRes.data.items);
      setAiInsight(invRes.data.aiInsight);

      // Fetch customer flow prediction
      const flowRes = await axios.get('/api/woolworths/customer-flow/predict');
      setCustomerFlow(flowRes.data.predictions);

      // Fetch employee wellness
      const wellnessRes = await axios.get('/api/woolworths/employee/wellness/dashboard');
      setWellness(wellnessRes.data);
    } catch (error) {
      console.error('Error fetching Woolworths data:', error);
    }
  };

  const lowStockItems = inventory.filter(item => item.stock < item.suggestedReorder * 0.5);
  const nextHourFlow = customerFlow[0]?.predictedCustomers || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-cyan-300 mb-2">🛒 Woolworths Elite</h1>
        <p className="text-white/70">AI-Powered Operations Control Center</p>
      </div>

      {/* AI Brain Insight */}
      <GlassCard className="p-6 border-purple-400/50 text-center">
        <FaBrain className="text-5xl text-purple-400 mx-auto mb-3 animate-pulse" />
        <h3 className="text-2xl font-bold mb-2">Aura's Current Insight</h3>
        <p className="text-xl text-purple-300">{aiInsight || 'Analyzing operations...'}</p>
      </GlassCard>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-6 text-center border-red-400/30">
          <FaExclamationTriangle className="text-4xl text-red-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-red-300">{lowStockItems.length}</p>
          <p className="text-sm text-white/60">Low Stock Items</p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-blue-400/30">
          <FaUsers className="text-4xl text-blue-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-blue-300">{nextHourFlow}</p>
          <p className="text-sm text-white/60">Customers (Next Hour)</p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-green-400/30">
          <FaDollarSign className="text-4xl text-green-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-green-300">$24.5K</p>
          <p className="text-sm text-white/60">Revenue Today</p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-yellow-400/30">
          <FaHeart className="text-4xl text-yellow-400 mx-auto mb-2" />
          <p className="text-3xl font-bold text-yellow-300">{wellness?.averageFatigue.toFixed(0) || 0}</p>
          <p className="text-sm text-white/60">Avg. Fatigue Score</p>
        </GlassCard>
      </div>

      {/* Inventory Management */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaBoxes className="text-3xl text-cyan-400" />
          <h2 className="text-2xl font-bold">Smart Inventory</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.slice(0, 6).map(item => (
            <div 
              key={item.sku} 
              className={`p-4 rounded-lg backdrop-blur-xl ${
                item.stock < item.suggestedReorder * 0.5 ? 'bg-red-500/20 border border-red-400/50' : 'bg-white/5 border border-white/10'
              }`}
            >
              <h3 className="font-bold">{item.sku}</h3>
              <p className="text-2xl text-cyan-300">{item.stock} units</p>
              <p className="text-sm text-white/60">Demand: {item.demand}</p>
              {item.stock < item.suggestedReorder * 0.5 && (
                <button className="mt-2 w-full py-1 bg-red-600 hover:bg-red-500 rounded text-sm font-semibold">
                  Reorder Now
                </button>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Customer Flow Prediction */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaChartLine className="text-3xl text-purple-400" />
          <h2 className="text-2xl font-bold">Customer Flow Forecast</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4">
          {customerFlow.slice(0, 12).map((flow, idx) => (
            <div 
              key={idx} 
              className="min-w-[80px] p-3 bg-white/5 border border-white/10 rounded-lg text-center"
            >
              <p className="text-xs text-white/60">{flow.hour}:00</p>
              <p className="text-2xl font-bold text-purple-300">{flow.predictedCustomers}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Employee Wellness */}
      {wellness && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaHeart className="text-3xl text-red-400" />
            <h2 className="text-2xl font-bold">Employee Wellness Monitor</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-white/70">Total Employees Monitored:</p>
              <p className="text-4xl font-bold text-cyan-300">{wellness.totalEmployees}</p>
            </div>
            <div>
              <p className="text-white/70">High Fatigue Alerts:</p>
              <p className="text-4xl font-bold text-red-300">{wellness.highFatigueCount}</p>
            </div>
          </div>
          <div className={`mt-4 p-4 rounded-lg ${wellness.highFatigueCount > 0 ? 'bg-red-500/20 border border-red-400/50' : 'bg-green-500/20 border border-green-400/50'}`}>
            <p className="font-semibold">🧠 Aura Recommendation:</p>
            <p className="text-white/80">{wellness.recommendation}</p>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
