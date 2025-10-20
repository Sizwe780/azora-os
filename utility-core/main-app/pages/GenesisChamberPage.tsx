import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getGenesisChamberData, GenesisProposal, ICONS } from '../features/genesis-chamber/mockData';
import GenesisVisualizer from '../components/genesis-chamber/GenesisVisualizer';
import ApprovalControls from '../components/genesis-chamber/ApprovalControls';
import PageHeader from '../components/ui/PageHeader';

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
        transition={{ duration: 0.5 }}
        className="relative min-h-screen bg-gray-950 text-white p-4 sm:p-6 lg:p-8"
      >
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-gray-950 to-gray-800 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <PageHeader icon={Zap} title={proposal.title} subtitle={proposal.summary || ''} />

        <main className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-950/60 border border-cyan-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-xl"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-cyan-200">{proposal.title}</h1>
                <p className="text-gray-400 mt-1">Proposal ID: <span className="font-mono text-xs">{proposal.proposalId}</span></p>
              </div>
              <div className={`mt-4 md:mt-0 px-3 py-1 rounded-full text-sm font-semibold ${
                proposal.status === 'awaiting_approval' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'
              }`}>
                {proposal.status}
              </div>
            </div>

            <GenesisVisualizer proposal={proposal} />
            <ApprovalControls onApprove={() => handleApproval(true)} onReject={() => handleApproval(false)} />
          </motion.div>
        </main>
      </motion.div>
    </>
  );
};

export default GenesisChamberPage;



