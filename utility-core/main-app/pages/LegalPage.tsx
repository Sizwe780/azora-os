import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, CheckCircle, AlertTriangle, FileText, Shield, Briefcase } from 'lucide-react';
import { getMockLegalData, LegalData, ComplianceFramework, Contract, LitigationRisk, legalColors, legalIcons } from '../features/legal/mockLegal';

const StatCard = ({ icon: Icon, title, value, color, description }) => (
    <div className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-6`}>
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
                <Icon className={`w-7 h-7 text-${color}-400`} />
            </div>
            <p className={`text-3xl font-bold text-white`}>{value}</p>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    </div>
);

const ComplianceCard = ({ framework }: { framework: ComplianceFramework }) => {
    const color = legalColors[framework.status];
    const Icon = legalIcons[framework.status];
    return (
        <div className={`bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4 hover:border-${color}-500/50 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white">{framework.name}</h3>
                <div className={`flex items-center gap-2 text-xs font-semibold text-${color}-300`}>
                    <Icon size={16} />
                    {framework.status.toUpperCase()}
                </div>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
                <p>Violations: <span className="font-semibold text-white">{framework.violations}</span></p>
                <p>Last Audit: <span className="font-semibold text-white">{new Date(framework.lastAudit).toLocaleDateString()}</span></p>
                <p>Next Review: <span className="font-semibold text-white">{new Date(framework.nextReview).toLocaleDateString()}</span></p>
            </div>
        </div>
    );
};

const ContractRow = ({ contract }: { contract: Contract }) => {
    const riskColor = legalColors[contract.riskLevel];
    const statusColor = legalColors[contract.status];
    return (
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
                <p className="font-semibold text-white">{contract.title}</p>
                <p className="text-xs text-gray-400">{contract.type} - Created: {new Date(contract.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${riskColor}-900/70 text-${riskColor}-300`}>
                    {contract.riskLevel.toUpperCase()} RISK
                </span>
                <span className={`text-sm font-semibold text-${statusColor}-300`}>
                    {contract.status.toUpperCase()}
                </span>
            </div>
        </div>
    );
};

const LitigationRiskCard = ({ risk }: { risk: LitigationRisk }) => {
    const getRiskColor = (score) => score > 70 ? 'red' : score > 40 ? 'yellow' : 'green';
    const color = getRiskColor(risk.riskScore);

    return (
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{risk.category}</h3>
                <div className="text-right">
                    <p className={`text-3xl font-bold text-${color}-400`}>{risk.riskScore}</p>
                    <p className="text-xs text-gray-500">Risk Score</p>
                </div>
            </div>
            <div className={`w-full bg-gray-700 rounded-full h-2.5 mb-4`}>
                <div className={`bg-${color}-500 h-2.5 rounded-full`} style={{ width: `${risk.riskScore}%` }}></div>
            </div>
            <div className="text-sm text-gray-300 space-y-2 mb-4">
                <p>Active Issues: <span className="font-bold text-white">{risk.activeIssues}</span></p>
                <p>Potential Exposure: <span className="font-bold text-white">R{risk.potentialExposure.toLocaleString()}</span></p>
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-400 mb-2">Recommendations:</p>
                <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                    {risk.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
            </div>
        </div>
    );
};


export default function LegalPage() {
  const [data, setData] = useState<LegalData | null>(null);

  useEffect(() => {
    getMockLegalData().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <Briefcase className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Legal & Compliance</h1>
            <p className="text-cyan-300">Automated oversight of all legal and compliance frameworks.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard icon={Scale} title="Overall Compliance" value={`${data.complianceScore}%`} color="green" description="Weighted score across all frameworks" />
        <StatCard icon={AlertTriangle} title="Total Violations" value={data.totalViolations} color="red" description="Active, unresolved compliance breaches" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><Shield /> Compliance Frameworks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.complianceFrameworks.map((framework) => (
            <ComplianceCard key={framework.name} framework={framework} />
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><FileText /> Contract Review Queue</h2>
        <div className="space-y-4">
          {data.contracts.map((contract) => (
            <ContractRow key={contract.id} contract={contract} />
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><AlertTriangle /> Litigation Risk Assessment</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.litigationRisks.map((risk) => (
            <LitigationRiskCard key={risk.category} risk={risk} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}