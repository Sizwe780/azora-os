import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getGenesisChamberData, GenesisProposal, ICONS } from '../features/genesis-chamber/mockData';
import GenesisVisualizer from '../components/genesis-chamber/GenesisVisualizer';
import ApprovalControls from '../components/genesis-chamber/ApprovalControls';

const { Zap, BrainCircuit } = ICONS;

const GenesisChamberPage = () => {
  const { proposal: initialProposal } = getGenesisChamberData();
  const [proposal, setProposal] = useState<GenesisProposal | null>(initialProposal);

  const handleApproval = (isApproved: boolean) => {
    if (!proposal) return;
    setProposal({ ...proposal, status: isApproved ? 'approved' : 'rejected' });
  };

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-transparent">
        <BrainCircuit className="w-16 h-16 text-blue-500 mb-4" />
        <h1 className="text-3xl font-bold text-white">Aura is contemplating possibilities...</h1>
        <p className="text-gray-400 mt-2">New genesis proposals will emerge from the data stream.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Genesis Chamber | Azora</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 lg:p-8 text-white min-h-screen bg-transparent"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-cyan-300" />
            <h1 className="text-4xl font-bold text-cyan-300">Genesis Chamber</h1>
          </div>
          <p className="text-gray-400 mt-2">Witness Azora weaving new ventures from the fabric of reality.</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/30 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-lg"
        >
          <h2 className="text-3xl font-bold text-purple-300 mb-2">{proposal.title}</h2>
          <p className="text-gray-300 mb-8 max-w-4xl">{proposal.summary}</p>
          <GenesisVisualizer proposal={proposal} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {proposal.status === 'awaiting_approval' ? (
            <ApprovalControls onApprove={() => handleApproval(true)} onReject={() => handleApproval(false)} />
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="mt-12 text-center"
            >
              <h2 className={`text-3xl font-bold ${proposal.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                Genesis {proposal.status}. The network is adapting.
              </h2>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default GenesisChamberPage;



