import { motion } from 'framer-motion';
import { GenesisProposal, ICONS } from '../../features/genesis-chamber/mockData';
import InfoCard from './InfoCard';

const { User, DollarSign, BarChart, Package, Network } = ICONS;

interface GenesisVisualizerProps {
  proposal: GenesisProposal;
}

const GenesisVisualizer = ({ proposal }: GenesisVisualizerProps) => (
  <motion.div
    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    initial="hidden"
    animate="visible"
    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
  >
    <InfoCard icon={User} title="Target Operator" color="cyan">
      <p className="text-2xl text-cyan-300 font-semibold">{proposal.targetOperator.name}</p>
      <p className="text-sm text-gray-400">Klipp Level: {proposal.targetOperator.klippLevel}</p>
    </InfoCard>

    <InfoCard icon={DollarSign} title="Seed Capital" color="green">
      <p className="text-3xl text-green-300 font-bold">
        {proposal.genesisPackage.seedCapital.amount.toLocaleString()}
        <span className="text-xl ml-2">{proposal.genesisPackage.seedCapital.currency}</span>
      </p>
    </InfoCard>

    <InfoCard icon={BarChart} title="Projected Impact" color="yellow">
      <p className="text-gray-300">1st Month Revenue: <span className="font-semibold text-yellow-300">{proposal.projectedImpact.firstMonthRevenue}</span></p>
      <p className="text-gray-300">Time to Profitability: <span className="font-semibold text-yellow-300">{proposal.projectedImpact.timeToProfitability}</span></p>
    </InfoCard>

    <InfoCard icon={Package} title="Asset Allocation" color="purple">
      <ul className="list-disc list-inside space-y-1 text-purple-300">
        {proposal.genesisPackage.assetAllocation.map(a =>
          <li key={a.assetId}>{a.type} <span className="font-mono text-xs text-gray-500">({a.assetId})</span></li>
        )}
      </ul>
    </InfoCard>

    <InfoCard icon={Network} title="Network Orchestration" color="blue">
      <ul className="list-disc list-inside space-y-1 text-blue-300">
        {proposal.genesisPackage.networkOrchestration.map(n =>
          <li key={n.task}>{n.task} via <span className="font-semibold text-blue-200">{n.service}</span></li>
        )}
      </ul>
    </InfoCard>
  </motion.div>
);

export default GenesisVisualizer;
