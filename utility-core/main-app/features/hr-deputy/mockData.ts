import {
    Users, Brain, CheckCircle, AlertTriangle, TrendingUp,
    Globe, Target, Award, FileText, Activity,
    UserPlus, UserMinus, Briefcase, BarChart3, Shield,
    Zap, Eye, Search,
} from 'lucide-react';

export const ICONS = {
    Users, Brain, CheckCircle, AlertTriangle, TrendingUp,
    Globe, Target, Award, FileText, Activity,
    UserPlus, UserMinus, Briefcase, BarChart3, Shield,
    Zap, Eye, Search,
};

export type Person = {
    id: string;
    name: string;
    role: string;
    type: 'founder' | 'employee';
    performance: { score: number; lastReview: Date };
    equity?: number;
};

export type Task = {
    id: string;
    task: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'In Progress' | 'Completed' | 'Pending';
};

export type Tasks = {
    [personId: string]: Task[];
};

export type Stats = {
    totalEmployees: number;
    totalFounders: number;
    activeTasks: number;
    completedTasks: number;
    onboardingInProgress: number;
    activeExitProcesses: number;
    openResolutionCases: number;
    averagePerformance: number;
    globalReach: {
        targetCountries: string[];
        currentReach: string[];
    };
};

const mockFounders: Person[] = [
    { id: 'f-001', name: 'Sizwe Ngwenya', role: 'CEO & Chief Architect', type: 'founder', performance: { score: 0.98, lastReview: new Date('2023-12-01') }, equity: 65.0 },
    { id: 'f-002', name: 'Sizwe Motingwe', role: 'Head of Sales & Partnerships', type: 'founder', performance: { score: 0.92, lastReview: new Date('2023-12-01') }, equity: 12.0 },
    { id: 'f-003', name: 'Milla Mukundi', role: 'Operations & Support Lead', type: 'founder', performance: { score: 0.88, lastReview: new Date('2023-12-01') }, equity: 6.0 },
    { id: 'f-004', name: 'Nolundi Ngwenya', role: 'Head of Retail & Community', type: 'founder', performance: { score: 0.85, lastReview: new Date('2023-12-01') }, equity: 6.0 },
    { id: 'f-005', name: 'AZORA', role: 'HR AI Deputy CEO', type: 'founder', performance: { score: 1.0, lastReview: new Date() }, equity: 1.0 },
];

const mockEmployees: Person[] = [
    { id: 'e-001', name: 'John Doe', role: 'Senior Developer', type: 'employee', performance: { score: 0.91, lastReview: new Date('2023-11-15') } },
    { id: 'e-002', name: 'Jane Smith', role: 'Fleet Manager', type: 'employee', performance: { score: 0.78, lastReview: new Date('2023-11-20') } },
    { id: 'e-003', name: 'Peter Jones', role: 'Compliance Officer', type: 'employee', performance: { score: 0.82, lastReview: new Date('2023-11-22') } },
];

const mockTasks: Tasks = {
    'f-001': [{ id: 't-001', task: 'Finalize Q1 2025 Strategic Roadmap', priority: 'High', status: 'In Progress' }],
    'f-002': [{ id: 't-002', task: 'Secure partnership with major logistics firm', priority: 'High', status: 'In Progress' }],
    'e-001': [{ id: 't-003', task: 'Deploy quantum routing microservice update', priority: 'Medium', status: 'Completed' }],
};

const mockStats: Stats = {
    totalEmployees: mockEmployees.length,
    totalFounders: mockFounders.length,
    activeTasks: 23,
    completedTasks: 147,
    onboardingInProgress: 2,
    activeExitProcesses: 0,
    openResolutionCases: 1,
    averagePerformance: 0.89,
    globalReach: {
        targetCountries: ['ZA', 'ZW', 'BW', 'MZ', 'NA', 'ZM', 'US', 'UK', 'NG', 'KE'],
        currentReach: ['ZA']
    }
};

export const getHRDeputyCEOData = () => ({
    founders: mockFounders,
    employees: mockEmployees,
    tasks: mockTasks,
    stats: mockStats,
});
