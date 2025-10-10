import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { FaUser, FaWallet, FaProjectDiagram, FaChartLine, FaCheck, FaTimes } from 'react-icons/fa';

type GenesisProposal = {
  proposalId: string;
  title: string;
  summary: string;
  targetOperator: { name: string; klippLevel: number };
  genesisPackage: {
    seedCapital: { amount: number; currency: string };
    assetAllocation: { assetId: string; type: string }[];
    networkOrchestration: { service: string; task: string }[];
  };
  projectedImpact: { firstMonthRevenue: string; timeToProfitability: string };
  status: 'awaiting_approval' | 'approved' | 'rejected';
};

const GenesisVisualizer = ({ proposal }: { proposal: GenesisProposal }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
    <h2 className="text-3xl font-bold text-purple-300 mb-2">{proposal.title}</h2>
    <p className="text-white/80 mb-8">{proposal.summary}</p>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GlassCard className="p-6 border-purple-400/30">
        <h3 className="font-bold text-lg flex items-center gap-2"><FaUser /> Target Operator</h3>
        <p className="text-2xl text-cyan-300 mt-2">{proposal.targetOperator.name}</p>
        <p>Klipp Level: {proposal.targetOperator.klippLevel}</p>
      </GlassCard>
      
      <GlassCard className="p-6 border-purple-400/30">
        <h3 className="font-bold text-lg flex items-center gap-2"><FaWallet /> Seed Capital</h3>
        <p className="text-3xl text-green-300 mt-2">
          {proposal.genesisPackage.seedCapital.amount.toLocaleString()} {proposal.genesisPackage.seedCapital.currency}
        </p>
      </GlassCard>
      
      <GlassCard className="p-6 lg:col-span-1 border-purple-400/30">
        <h3 className="font-bold text-lg flex items-center gap-2"><FaChartLine /> Projected Impact</h3>
        <p className="mt-2">Revenue (1st Month): <span className="text-green-400">{proposal.projectedImpact.firstMonthRevenue}</span></p>
        <p>Time to Profit: <span className="text-green-400">{proposal.projectedImpact.timeToProfitability}</span></p>
      </GlassCard>

      <GlassCard className="p-6 lg:col-span-3 border-purple-400/30">
        <h3 className="font-bold text-lg flex items-center gap-2"><FaProjectDiagram /> Network Orchestration</h3>
        <ul className="list-disc list-inside mt-2 space-y-1">
          {proposal.genesisPackage.assetAllocation.map(a => 
            <li key={a.assetId}>Allocate Asset: {a.assetId} ({a.type})</li>
          )}
          {proposal.genesisPackage.networkOrchestration.map(n => 
            <li key={n.task}>Commission Task: {n.task}</li>
          )}
        </ul>
      </GlassCard>
    </div>
  </motion.div>
);

export default function GenesisChamberPage() {
  const [proposal, setProposal] = useState<GenesisProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await axios.post('/api/singularity/propose-genesis');
        setProposal(res.data);
      } catch (error) {
        console.error("Could not fetch Genesis proposal:", error);
        // TODO: Handle error gracefully - show error message to user
        setProposal(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposal();
  }, []);

  const handleApproval = (isApproved: boolean) => {
    if (!proposal) return;
    setProposal({ ...proposal, status: isApproved ? 'approved' : 'rejected' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-4xl font-bold text-cyan-300 mb-2">Genesis Chamber</h1>
      <p className="text-white/70 mb-8">Witness Aura creating new ventures from reality itself</p>
      
      {isLoading && <p>Aura is contemplating possibilities...</p>}
      
      {proposal && (
        <>
          <GenesisVisualizer proposal={proposal} />
          <div className="mt-12 text-center">
            {proposal.status === 'awaiting_approval' ? (
              <>
                <h2 className="text-2xl mb-4">Approve this Genesis?</h2>
                <div className="flex justify-center gap-6">
                  <button 
                    onClick={() => handleApproval(true)} 
                    className="px-10 py-4 bg-green-600 hover:bg-green-500 rounded-lg font-bold flex items-center gap-3"
                  >
                    <FaCheck /> Approve
                  </button>
                  <button 
                    onClick={() => handleApproval(false)} 
                    className="px-10 py-4 bg-red-600 hover:bg-red-500 rounded-lg font-bold flex items-center gap-3"
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              </>
            ) : (
              <h2 className={`text-3xl font-bold ${proposal.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                Genesis {proposal.status}. Reality is being woven.
              </h2>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
