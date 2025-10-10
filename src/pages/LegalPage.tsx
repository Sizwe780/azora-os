import React from 'react';
import { useEffect, useState } from 'react';
import { Scale, CheckCircle, AlertTriangle, FileText, Shield } from 'lucide-react';

interface ComplianceFramework {
  name: string;
  status: 'compliant' | 'at-risk' | 'non-compliant';
  lastAudit: Date;
  violations: number;
  nextReview: Date;
}

interface Contract {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  reviewedBy?: string;
}

interface LitigationRisk {
  category: string;
  riskScore: number;
  activeIssues: number;
  potentialExposure: number;
  recommendations: string[];
}

interface LegalData {
  complianceFrameworks: ComplianceFramework[];
  contracts: Contract[];
  litigationRisks: LitigationRisk[];
  totalViolations: number;
  complianceScore: number;
}

export default function LegalPage() {
  const [data, setData] = useState<LegalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLegal = async () => {
      try {
        const response = await fetch('/api/hr-ai/legal/compliance');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch legal data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLegal();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Failed to load legal data</p>
        </div>
      </div>
    );
  }

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-400';
      case 'at-risk':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Legal & Compliance Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">6 compliance frameworks, contract review, and litigation risk management</p>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <Scale className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Overall Compliance Score</p>
          <p className="text-5xl font-bold mt-2">{data.complianceScore}%</p>
          <div className="mt-3 bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full"
              style={{ width: `${data.complianceScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Total Violations</p>
          <p className="text-5xl font-bold mt-2">{data.totalViolations}</p>
          <p className="text-sm opacity-90 mt-3">Target: 0 violations</p>
        </div>
      </div>

      {/* Compliance Frameworks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Compliance Frameworks (6)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.complianceFrameworks.map((framework, index) => (
            <div
              key={index}
              className={`rounded-lg border-2 p-4 ${getComplianceColor(framework.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{framework.name}</h3>
                {framework.status === 'compliant' && <CheckCircle className="w-5 h-5" />}
                {framework.status === 'at-risk' && <AlertTriangle className="w-5 h-5" />}
              </div>
              <p className="text-xs font-semibold mb-2 uppercase">{framework.status.replace('-', ' ')}</p>
              <div className="space-y-1 text-sm">
                <p>Last Audit: {new Date(framework.lastAudit).toLocaleDateString()}</p>
                <p>Violations: {framework.violations}</p>
                <p>Next Review: {new Date(framework.nextReview).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Review Queue */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Contract Review Queue</span>
        </h2>
        <div className="space-y-3">
          {data.contracts.length === 0 ? (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-green-600 dark:text-green-400 font-medium">No contracts pending review</p>
            </div>
          ) : (
            data.contracts.map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{contract.title}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{contract.type}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getRiskColor(contract.riskLevel)}`}>
                        {contract.riskLevel.toUpperCase()} RISK
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{contract.status}</p>
                  {contract.reviewedBy && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">By: {contract.reviewedBy}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Litigation Risk Dashboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Litigation Risk Assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.litigationRisks.map((risk, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white">{risk.category}</h3>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{risk.riskScore}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Risk Score</p>
                </div>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full ${
                    risk.riskScore > 70 ? 'bg-red-500' :
                    risk.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${risk.riskScore}%` }}
                ></div>
              </div>
              <div className="space-y-2 mb-3 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Active Issues:</span> {risk.activeIssues}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Potential Exposure:</span> R{(risk.potentialExposure / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded p-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Recommendations:</p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {risk.recommendations.map((rec, idx) => (
                    <li key={idx}>• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
