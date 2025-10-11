import {
  Activity,
  Zap,
  TrendingUp,
  Shield,
  Truck,
  BrainCircuit,
  Cloud,
  Users,
  DollarSign,
  Package,
  FileText,
  Briefcase,
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export interface StatCardData {
  id: string;
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  color: string;
}

export interface ServiceModuleData {
  id: string;
  icon: React.ElementType;
  name: string;
  description: string;
  path: string;
  status: 'operational' | 'degraded' | 'maintenance';
  tags: string[];
}

export interface QuickActionData {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

export interface RecentActivityData {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

// --- MOCK DATA ---

export const mockStats: StatCardData[] = [
  {
    id: 'active-services',
    icon: Zap,
    label: 'Active Services',
    value: '18',
    change: '+2',
    changeType: 'increase',
    color: 'cyan',
  },
  {
    id: 'revenue',
    icon: DollarSign,
    label: 'Projected Revenue',
    value: 'R1.2M',
    change: '+5.2%',
    changeType: 'increase',
    color: 'green',
  },
  {
    id: 'fleet-status',
    icon: Truck,
    label: 'Fleet Online',
    value: '89%',
    change: '-1%',
    changeType: 'decrease',
    color: 'blue',
  },
  {
    id: 'security-threats',
    icon: Shield,
    label: 'Threats Neutralized',
    value: '1,204',
    change: '0',
    changeType: 'neutral',
    color: 'purple',
  },
];

export const mockServiceModules: ServiceModuleData[] = [
  {
    id: 'quantum-ai',
    name: 'Quantum AI Core',
    description: 'Central reasoning and prediction engine.',
    icon: BrainCircuit,
    path: '/quantum-ai',
    status: 'operational',
    tags: ['AI', 'Core'],
  },
  {
    id: 'fleet-command',
    name: 'Driver Command',
    description: 'Manage and optimize driver operations.',
    icon: Truck,
    path: '/driver-command-center',
    status: 'operational',
    tags: ['Logistics', 'Fleet'],
  },
  {
    id: 'cold-chain',
    name: 'Cold Chain',
    description: 'Quantum-level temperature integrity.',
    icon: Zap,
    path: '/cold-chain-command',
    status: 'operational',
    tags: ['Logistics', 'High-Value'],
  },
  {
    id: 'universal-safety',
    name: 'Universal Safety',
    description: 'Proactive threat detection and response.',
    icon: Shield,
    path: '/universal-safety-command',
    status: 'degraded',
    tags: ['Security', 'AI'],
  },
  {
    id: 'hr-deputy',
    name: 'HR Deputy CEO',
    description: 'Automated HR and compliance management.',
    icon: Users,
    path: '/hr-deputy-ceo',
    status: 'operational',
    tags: ['Admin', 'HR'],
  },
  {
    id: 'doc-vault',
    name: 'Document Vault',
    description: 'Secure, verified document storage.',
    icon: FileText,
    path: '/document-vault',
    status: 'maintenance',
    tags: ['Admin', 'Security'],
  },
];

export const mockQuickActions: QuickActionData[] = [
    { id: 'ask-ai', label: 'Ask Quantum AI', path: '/quantum-ai', icon: BrainCircuit },
    { id: 'view-fleet', label: 'View Fleet', path: '/driver-command-center', icon: Truck },
    { id: 'security-overview', label: 'Security', path: '/security', icon: Shield },
    { id: 'finance-dashboard', label: 'Finance', path: '/finance', icon: DollarSign },
];

export const mockRecentActivity: RecentActivityData[] = [
  {
    id: 'act-1',
    user: 'AI Sentinel',
    action: 'Neutralized Threat',
    timestamp: format(new Date(), 'HH:mm:ss'),
    details: 'Blocked unauthorized access attempt on `auth-service`.',
  },
  {
    id: 'act-2',
    user: 'Quantum Logistics',
    action: 'Route Optimized',
    timestamp: format(subDays(new Date(), 0).setHours(14, 32), 'HH:mm:ss'),
    details: 'Rerouted 3 vehicles around new traffic anomaly.',
  },
  {
    id: 'act-3',
    user: 'HR Deputy',
    action: 'Compliance Alert',
    timestamp: format(subDays(new Date(), 0).setHours(11, 54), 'HH:mm:ss'),
    details: 'Flagged expiring driver certification for renewal.',
  },
  {
    id: 'act-4',
    user: 'Cold Chain AI',
    action: 'Intervention',
    timestamp: format(subDays(new Date(), 0).setHours(9, 15), 'HH:mm:ss'),
    details: 'Adjusted cooling unit on `AZ-CC-003` to prevent spoilage.',
  },
];

export const mockUserData = {
    name: 'Founder',
    role: 'Chief Executive Officer',
    avatarUrl: '/founder-avatar.png',
    systemStatus: 'All systems operational',
    systemStatusColor: 'text-green-400'
};
