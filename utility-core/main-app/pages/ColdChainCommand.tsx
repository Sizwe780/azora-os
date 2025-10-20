import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Snowflake, Bolt, AlertTriangle, Coins } from 'lucide-react';

import {
  mockAssets,
  generatePredictions,
  mockInterventions,
  mockEnergyData,
  mockBlockchainData,
  ColdChainAsset,
} from '../features/cold-chain/mockColdChainData';

import StatCard from '../components/cold-chain/StatCard';
import AssetSelector from '../components/cold-chain/AssetSelector';
import PredictionChart from '../components/cold-chain/PredictionChart';
import InterventionsPanel from '../components/cold-chain/InterventionsPanel';
import BlockchainIntegrity from '../components/cold-chain/BlockchainIntegrity';

export default function ColdChainCommand() {
  const [selectedAsset, setSelectedAsset] = useState<ColdChainAsset>(mockAssets[0]);

  const predictions = useMemo(() => generatePredictions(selectedAsset.currentTemp), [selectedAsset]);
  const totalValueSaved = useMemo(() => mockInterventions.reduce((sum, i) => sum + i.financialImpact.savedAmount, 0), []);

  const statCards = [
    { icon: Snowflake, title: "Active Assets", value: mockAssets.length.toString(), color: '#60A5FA', index: 0 },
    { icon: Bolt, title: "Energy Savings", value: `${mockEnergyData.savingsPercent.toFixed(1)}%`, color: '#4ADE80', index: 1 },
    { icon: AlertTriangle, title: "Interventions", value: mockInterventions.length.toString(), color: '#A78BFA', index: 2 },
    { icon: Coins, title: "Value Saved", value: `$${(totalValueSaved / 1000).toFixed(0)}k`, color: '#FBBF24', index: 3 },
  ];

  return (
    <>
      <Helmet>
        <title>Cold Chain Command | Azora</title>
        <meta name="description" content="Zero-Loss Guarantee • Molecular Precision • Autonomous Protection. Monitor and manage your high-value, temperature-sensitive assets with quantum-level precision." />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-950 min-h-screen text-white">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <Snowflake className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Cold Chain Quantum Engine</h1>
              <p className="text-blue-300/80">Zero-Loss Guarantee • Molecular Precision • Autonomous Protection</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {statCards.map(card => <StatCard key={card.title} {...card} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AssetSelector assets={mockAssets} selectedAsset={selectedAsset} onSelectAsset={setSelectedAsset} />
            <PredictionChart predictions={predictions} assetName={selectedAsset.name} />
          </div>

          <div className="space-y-6">
            <InterventionsPanel interventions={mockInterventions} />
            <BlockchainIntegrity data={mockBlockchainData} />
          </div>
        </div>
      </div>
    </>
  );
}
