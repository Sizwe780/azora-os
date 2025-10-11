import { CheckCircle, AlertTriangle, Shield, FileText, Scale } from 'lucide-react';

export interface ComplianceFramework {
  name: string;
  status: 'compliant' | 'at-risk' | 'non-compliant';
  lastAudit: string;
  violations: number;
  nextReview: string;
}

export interface Contract {
  id: string;
  title: string;
  type: 'MSA' | 'SOW' | 'NDA' | 'Partnership';
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  reviewedBy?: string;
}

export interface LitigationRisk {
  category: string;
  riskScore: number; // 0-100
  activeIssues: number;
  potentialExposure: number; // in ZAR
  recommendations: string[];
}

export interface LegalData {
  complianceFrameworks: ComplianceFramework[];
  contracts: Contract[];
  litigationRisks: LitigationRisk[];
  totalViolations: number;
  complianceScore: number; // 0-100
}

const MOCK_LEGAL_DATA: LegalData = {
  complianceScore: 92,
  totalViolations: 3,
  complianceFrameworks: [
    { name: 'POPIA', status: 'compliant', lastAudit: '2024-06-01T00:00:00.000Z', violations: 0, nextReview: '2025-06-01T00:00:00.000Z' },
    { name: 'B-BBEE', status: 'compliant', lastAudit: '2024-05-15T00:00:00.000Z', violations: 0, nextReview: '2025-05-15T00:00:00.000Z' },
    { name: 'ISO 27001', status: 'at-risk', lastAudit: '2024-07-10T00:00:00.000Z', violations: 2, nextReview: '2025-01-10T00:00:00.000Z' },
    { name: 'NCA', status: 'compliant', lastAudit: '2024-04-20T00:00:00.000Z', violations: 0, nextReview: '2025-04-20T00:00:00.000Z' },
    { name: 'OHSA', status: 'non-compliant', lastAudit: '2024-07-05T00:00:00.000Z', violations: 1, nextReview: '2024-10-05T00:00:00.000Z' },
    { name: 'Companies Act', status: 'compliant', lastAudit: '2024-06-25T00:00:00.000Z', violations: 0, nextReview: '2025-06-25T00:00:00.000Z' },
  ],
  contracts: [
    { id: 'CTR-001', title: 'QuantumLeap Logistics MSA', type: 'MSA', status: 'pending', riskLevel: 'medium', createdAt: '2024-07-18T00:00:00.000Z' },
    { id: 'CTR-002', title: 'Project Chimera SOW', type: 'SOW', status: 'pending', riskLevel: 'high', createdAt: '2024-07-15T00:00:00.000Z' },
    { id: 'CTR-003', title: 'StealthCo Partnership Agreement', type: 'Partnership', status: 'reviewed', riskLevel: 'low', createdAt: '2024-07-12T00:00:00.000Z', reviewedBy: 'HR-AI Deputy' },
    { id: 'CTR-004', 'title': 'Data Fusion NDA', type: 'NDA', status: 'approved', riskLevel: 'low', createdAt: '2024-07-10T00:00:00.000Z', reviewedBy: 'HR-AI Deputy' },
  ],
  litigationRisks: [
    {
      category: 'Employment Law',
      riskScore: 68,
      activeIssues: 2,
      potentialExposure: 750000,
      recommendations: ['Review overtime policy', 'Update contractor agreements'],
    },
    {
      category: 'Intellectual Property',
      riskScore: 35,
      activeIssues: 1,
      potentialExposure: 1200000,
      recommendations: ['Conduct IP audit for Project Chimera', 'Strengthen open-source usage policy'],
    },
  ],
};

export const getMockLegalData = (): Promise<LegalData> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_LEGAL_DATA);
        }, 500);
    });
}

export const legalIcons = {
    compliant: CheckCircle,
    'at-risk': AlertTriangle,
    'non-compliant': AlertTriangle,
    low: Shield,
    medium: AlertTriangle,
    high: AlertTriangle,
};

export const legalColors = {
    compliant: 'green',
    'at-risk': 'yellow',
    'non-compliant': 'red',
    low: 'green',
    medium: 'yellow',
    high: 'red',
    pending: 'blue',
    reviewed: 'purple',
    approved: 'green',
    rejected: 'red',
};
