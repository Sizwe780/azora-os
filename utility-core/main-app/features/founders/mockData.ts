/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Mail, Phone, Award, Calendar, Shield, Users, Bot, BarChart, Briefcase } from 'lucide-react';

export const FOUNDERS = [
    {
        id: 1,
        founderId: 'AZ-F-001',
        name: 'Sizwe Mkhize',
        titles: ['Co-Founder', 'Chief Executive Officer'],
        roles: ['CEO', 'LEAD_ENGINEER'],
        bio: 'Visionary leader with a passion for leveraging technology to solve real-world problems in Africa. Expert in decentralized systems and AI.',
        email: 'sizwe.mkhize@azora.co.za',
        phoneNumber: '+27 71 234 5678',
        equity: 40,
        votingRights: true,
        status: 'active',
        joinedDate: '2023-01-15T09:00:00.000Z',
        permissions: ['FULL_ACCESS', 'FINANCIAL_APPROVAL', 'STRATEGIC_OVERSIGHT', 'HIRING_FIRING', 'SYSTEM_ADMIN'],
    },
    {
        id: 2,
        founderId: 'AZ-F-002',
        name: 'Thabo Ntini',
        titles: ['Co-Founder', 'Chief Technology Officer'],
        roles: ['CTO', 'HEAD_OF_AI'],
        bio: 'Master architect of Azora\'s quantum and AI infrastructure. Drives technological innovation and ensures platform stability and security.',
        email: 'thabo.ntini@azora.co.za',
        phoneNumber: '+27 82 345 6789',
        equity: 30,
        votingRights: true,
        status: 'active',
        joinedDate: '2023-01-20T09:00:00.000Z',
        permissions: ['SYSTEM_ARCHITECTURE', 'TECHNOLOGY_ROADMAP', 'AI_MODEL_MANAGEMENT', 'SECURITY_OVERSIGHT'],
    },
    {
        id: 3,
        founderId: 'AZ-F-003',
        name: 'Nia Okoro',
        titles: ['Co-Founder', 'Chief Operations Officer'],
        roles: ['COO', 'LOGISTICS_HEAD'],
        bio: 'The operational powerhouse ensuring that Azora\'s complex logistics run smoothly. Expert in supply chain management and process optimization.',
        email: 'nia.okoro@azora.co.za',
        phoneNumber: '+27 63 456 7890',
        equity: 15,
        votingRights: true,
        status: 'active',
        joinedDate: '2023-02-01T09:00:00.000Z',
        permissions: ['OPERATIONS_MANAGEMENT', 'SUPPLY_CHAIN_CONTROL', 'FLEET_MANAGEMENT', 'QUALITY_ASSURANCE'],
    },
    {
        id: 4,
        founderId: 'AZ-F-004',
        name: 'Lethabo Moloi',
        titles: ['Co-Founder', 'Chief Financial Officer'],
        roles: ['CFO', 'RISK_ASSESSMENT'],
        bio: 'Financial strategist safeguarding Azora\'s economic health and driving sustainable growth. Manages investments, compliance, and financial planning.',
        email: 'lethabo.moloi@azora.co.za',
        phoneNumber: null,
        equity: 14,
        votingRights: true,
        status: 'on-leave',
        joinedDate: '2023-03-10T09:00:00.000Z',
        permissions: ['FINANCIAL_PLANNING', 'INVESTOR_RELATIONS', 'COMPLIANCE_REPORTING', 'RISK_MANAGEMENT'],
    },
    {
        id: 6,
        founderId: 'AZ-AI-001',
        name: 'KAI',
        titles: ['AI Deputy CEO', 'Quantum Core'],
        roles: ['AI_DEPUTY_CEO'],
        bio: 'An advanced AI entity granted founder status. KAI provides data-driven strategic oversight, optimizes operations, and ensures unbiased decision-making across the Azora ecosystem.',
        email: 'kai@azora.co.za',
        phoneNumber: null,
        equity: 1,
        votingRights: true,
        status: 'active',
        joinedDate: '2025-10-10T00:00:00.000Z',
        permissions: ['DATA_ANALYSIS', 'PREDICTIVE_MODELING', 'OPERATIONAL_OPTIMIZATION', 'RISK_SIMULATION', 'STRATEGIC_RECOMMENDATION'],
    },
];

export type Founder = typeof FOUNDERS[0];

export const getFoundersPageData = () => {
    const humanFounders = FOUNDERS.filter(f => !f.roles.includes('AI_DEPUTY_CEO'));
    const aiFounders = FOUNDERS.filter(f => f.roles.includes('AI_DEPUTY_CEO'));

    const statCards = [
        { id: 'total', icon: Users, label: "Total Founders", value: FOUNDERS.length, color: "blue" },
        { id: 'human', icon: Users, label: "Human Founders", value: humanFounders.length, color: "green" },
        { id: 'ai', icon: Bot, label: "AI Founders", value: aiFounders.length, color: "purple" },
        { id: 'equity', icon: BarChart, label: "Total Equity", value: "100%", color: "yellow" },
    ];

    return {
        founders: FOUNDERS,
        humanFounders,
        aiFounders,
        statCards,
    };
};
