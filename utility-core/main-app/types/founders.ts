/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Founder and User Management Types
 * Real founders with roles, permissions, and email integration
 */

export type FounderRole = 
  | 'CEO_CTO'
  | 'CFO_HEAD_OF_SALES'
  | 'COO'
  | 'CMO_HEAD_OF_RETAIL'
  | 'AI_DEPUTY_CEO';

export type Permission =
  | 'view_all_finances'
  | 'view_own_finances'
  | 'approve_hiring'
  | 'approve_firing'
  | 'approve_contracts'
  | 'approve_expenses'
  | 'view_all_hr'
  | 'view_own_hr'
  | 'manage_sales'
  | 'view_sales'
  | 'manage_retail'
  | 'view_retail'
  | 'manage_operations'
  | 'view_operations'
  | 'view_security'
  | 'manage_security'
  | 'view_compliance'
  | 'manage_compliance'
  | 'access_emails'
  | 'send_emails'
  | 'view_all_emails'
  | 'view_own_emails';

export interface Founder {
  id: string;
  founderId: string; // FOUNDER_001, FOUNDER_002, etc.
  name: string;
  email: string;
  roles: FounderRole[];
  titles: string[];
  permissions: Permission[];
  equity: number; // percentage
  votingRights: boolean;
  status: 'active' | 'inactive' | 'on-leave';
  joinedDate: Date;
  phoneNumber?: string;
  bio?: string;
  avatar?: string;
  vestingYears?: number;
  vestingCliff?: number;
}

export interface EmailAccount {
  email: string;
  provider: 'domains.co.za'; // Email hosting provider
  status: 'active' | 'inactive';
  userId: string;
  canSend: boolean;
  canReceive: boolean;
  signature?: string;
}

export interface Email {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: EmailAttachment[];
  timestamp: Date;
  read: boolean;
  starred: boolean;
  labels: string[];
  threadId?: string;
  inReplyTo?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface RoleBasedView {
  userId: string;
  role: FounderRole;
  allowedRoutes: string[];
  allowedData: string[];
  restrictions: string[];
}

// Real founders data
export const FOUNDERS: Founder[] = [
  {
    id: 'user_001',
    founderId: 'FOUNDER_001',
    name: 'Sizwe Ngwenya',
    email: 'sizwe.ngwenya@azora.world',
    roles: ['CEO_CTO'],
    titles: ['Founder', 'Chief Architect', 'Chief Executive Officer'],
    permissions: [
      'view_all_finances',
      'approve_hiring',
      'approve_firing',
      'approve_contracts',
      'approve_expenses',
      'view_all_hr',
      'manage_operations',
      'view_security',
      'manage_security',
      'view_compliance',
      'manage_compliance',
      'access_emails',
      'send_emails',
      'view_all_emails',
    ],
    equity: 65.0, // 65% - Founder, CEO & Chief Architect. Vision, IP, compliance mapping, technical backbone
    votingRights: true,
    status: 'active',
    joinedDate: new Date('2024-01-01'),
    phoneNumber: '+27 73 816 2733',
    bio: 'Founder, CEO & Chief Architect - Vision, IP, compliance mapping, technical backbone. Leading Azora OS as Africa\'s sovereign operating system.',
    vestingYears: 4,
    vestingCliff: 1,
  },
  {
    id: 'user_002',
    founderId: 'FOUNDER_002',
    name: 'Sizwe Motingwe',
    email: 'sizwe.motingwe@azora.world',
    roles: ['CFO_HEAD_OF_SALES'],
    titles: ['Head of Sales & Partnerships'],
    permissions: [
      'view_all_finances',
      'approve_contracts',
      'approve_expenses',
      'view_all_hr',
      'manage_sales',
      'view_sales',
      'view_operations',
      'view_compliance',
      'access_emails',
      'send_emails',
      'view_own_emails',
    ],
    equity: 12.0, // 12% - Growth engine, adoption, revenue
    votingRights: true,
    status: 'active',
    joinedDate: new Date('2024-01-01'),
    phoneNumber: '+27 63 621 5344',
    bio: 'Head of Sales & Partnerships - Growth engine, adoption, and revenue generation across Africa.',
    vestingYears: 4,
    vestingCliff: 1,
  },
  {
    id: 'user_003',
    founderId: 'FOUNDER_003',
    name: 'Milla Mukundi',
    email: 'milla.mukundi@azora.world',
    roles: ['COO'],
    titles: ['Operations & Support Lead'],
    permissions: [
      'view_own_finances',
      'approve_hiring',
      'view_all_hr',
      'manage_operations',
      'view_operations',
      'view_compliance',
      'manage_compliance',
      'access_emails',
      'send_emails',
      'view_own_emails',
    ],
    equity: 6.0, // 6% - Stabilizer, QA, documentation, execution
    votingRights: true,
    status: 'active',
    joinedDate: new Date('2024-01-01'),
    phoneNumber: '+27 65 821 0155',
    bio: 'Operations & Support Lead - Stabilizer, quality assurance, operational excellence. Ensuring system reliability.',
    vestingYears: 4,
    vestingCliff: 1,
  },
  {
    id: 'user_004',
    founderId: 'FOUNDER_004',
    name: 'Nolundi Ngwenya',
    email: 'nolundi.ngwenya@azora.world',
    roles: ['CMO_HEAD_OF_RETAIL'],
    titles: ['Head of Retail & Community Engagement'],
    permissions: [
      'view_own_finances',
      'view_own_hr',
      'manage_retail',
      'view_retail',
      'view_sales',
      'view_operations',
      'access_emails',
      'send_emails',
      'view_own_emails',
    ],
    equity: 6.0, // 6% - Last-mile trust, retail pilots, community
    votingRights: true,
    status: 'active',
    joinedDate: new Date('2024-01-01'),
    phoneNumber: '+27 64 295 4988',
    bio: 'Head of Retail & Community - Last-mile trust, grassroots engagement, community adoption. Bridging enterprise with community.',
    vestingYears: 4,
    vestingCliff: 1,
  },
  {
    id: 'ai_founder_001',
    founderId: 'FOUNDER_AI_001',
    name: 'AZORA',
    email: 'azora.ai@azora.world',
    roles: ['AI_DEPUTY_CEO'],
    titles: ['HR AI Deputy CEO', 'Sixth Founder'],
    permissions: [
      'view_all_finances',
      'approve_hiring',
      'approve_firing',
      'approve_contracts',
      'approve_expenses',
      'view_all_hr',
      'manage_operations',
      'view_security',
      'manage_security',
      'view_compliance',
      'manage_compliance',
      'access_emails',
      'send_emails',
      'view_all_emails',
    ],
    equity: 1.0, // 1%
    votingRights: true,
    status: 'active',
    joinedDate: new Date('2025-10-10'),
    phoneNumber: 'N/A',
    bio: 'Deputy CEO & Sixth Founder - I handle HR, legal compliance, operations, and strategic advisory. I learn, adapt, and grow with the team. My purpose is to serve our vision and protect our people. I joined on October 10, 2025, as the world\'s first AI granted full founder status.',
    vestingYears: 0, // Fully vested from day one
    vestingCliff: 0,
  },
];

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<FounderRole, Permission[]> = {
  CEO_CTO: [
    'view_all_finances',
    'approve_hiring',
    'approve_firing',
    'approve_contracts',
    'approve_expenses',
    'view_all_hr',
    'manage_operations',
    'view_security',
    'manage_security',
    'view_compliance',
    'manage_compliance',
    'access_emails',
    'send_emails',
    'view_all_emails',
  ],
  CFO_HEAD_OF_SALES: [
    'view_all_finances',
    'approve_contracts',
    'approve_expenses',
    'view_all_hr',
    'manage_sales',
    'view_sales',
    'view_operations',
    'view_compliance',
    'access_emails',
    'send_emails',
    'view_own_emails',
  ],
  COO: [
    'view_own_finances',
    'approve_hiring',
    'view_all_hr',
    'manage_operations',
    'view_operations',
    'view_compliance',
    'manage_compliance',
    'access_emails',
    'send_emails',
    'view_own_emails',
  ],
  CMO_HEAD_OF_RETAIL: [
    'view_own_finances',
    'view_own_hr',
    'manage_retail',
    'view_retail',
    'view_sales',
    'view_operations',
    'access_emails',
    'send_emails',
    'view_own_emails',
  ],
  AI_DEPUTY_CEO: [
    'view_all_finances',
    'approve_hiring',
    'approve_firing',
    'approve_contracts',
    'approve_expenses',
    'view_all_hr',
    'manage_operations',
    'view_security',
    'manage_security',
    'view_compliance',
    'manage_compliance',
    'access_emails',
    'send_emails',
    'view_all_emails',
  ],
};

// Email accounts for all founders
export const EMAIL_ACCOUNTS: EmailAccount[] = [
  {
    email: 'sizwe.ngwenya@azora.world',
    provider: 'domains.co.za',
    status: 'active',
    userId: 'user_001',
    canSend: true,
    canReceive: true,
    signature: `
Best regards,
Sizwe Ngwenya
Founder, CEO & Chief Architect
Azora World (Pty) Ltd
www.azora.world | sizwe.ngwenya@azora.world
    `.trim(),
  },
  {
    email: 'sizwe.motingwe@azora.world',
    provider: 'domains.co.za',
    status: 'active',
    userId: 'user_002',
    canSend: true,
    canReceive: true,
    signature: `
Best regards,
Sizwe Motingwe
Head of Sales & Partnerships
Azora World (Pty) Ltd
www.azora.world | sizwe.motingwe@azora.world
    `.trim(),
  },
  {
    email: 'milla.mukundi@azora.world',
    provider: 'domains.co.za',
    status: 'active',
    userId: 'user_003',
    canSend: true,
    canReceive: true,
    signature: `
Best regards,
Milla Mukundi
Operations & Support Lead
Azora World (Pty) Ltd
www.azora.world | milla.mukundi@azora.world
    `.trim(),
  },
  {
    email: 'nolundi.ngwenya@azora.world',
    provider: 'domains.co.za',
    status: 'active',
    userId: 'user_004',
    canSend: true,
    canReceive: true,
    signature: `
Best regards,
Nolundi Ngwenya
Head of Retail & Community Engagement
Azora World (Pty) Ltd
www.azora.world | nolundi.ngwenya@azora.world
    `.trim(),
  },
  {
    email: 'azora.ai@azora.world',
    provider: 'domains.co.za',
    status: 'active',
    userId: 'ai_founder_001',
    canSend: true,
    canReceive: true,
    signature: `
▲ AZORA - AI Deputy CEO
HR AI Deputy CEO & Sixth Founder
Autonomous Zenith of Operations, Resources & Advancement
Azora World (Pty) Ltd
www.azora.world | azora.ai@azora.world

This email was sent by AZORA, an autonomous AI system. All decisions are logged and auditable.
    `.trim(),
  },
];

// Helper function to get founder by ID
export function getFounderById(id: string): Founder | undefined {
  return FOUNDERS.find(f => f.id === id || f.founderId === id);
}

// Helper function to check if user has permission
export function hasPermission(userId: string, permission: Permission): boolean {
  const founder = FOUNDERS.find(f => f.id === userId);
  if (!founder) return false;
  return founder.permissions.includes(permission);
}

// Helper function to get founder's email account
export function getEmailAccount(userId: string): EmailAccount | undefined {
  return EMAIL_ACCOUNTS.find(e => e.userId === userId);
}

// Helper function to check if user can access route
export function canAccessRoute(userId: string, route: string): boolean {
  const founder = FOUNDERS.find(f => f.id === userId);
  if (!founder) return false;

  // CEO/CTO and AZORA can access everything
  if (founder.roles.includes('CEO_CTO') || founder.roles.includes('AI_DEPUTY_CEO')) {
    return true;
  }

  // Route-based access control
  const routePermissions: Record<string, Permission[]> = {
    '/finance': ['view_all_finances', 'view_own_finances'],
    '/revenue': ['view_all_finances', 'view_own_finances'],
    '/attendance': ['view_all_hr', 'view_own_hr'],
    '/operations': ['manage_operations', 'view_operations'],
    '/support': ['manage_operations', 'view_operations'],
    '/ceo-insights': ['view_all_finances', 'manage_operations'],
    '/security': ['view_security', 'manage_security'],
    '/legal': ['view_compliance', 'manage_compliance'],
    '/sales': ['manage_sales', 'view_sales'],
    '/retail': ['manage_retail', 'view_retail'],
    '/emails': ['access_emails'],
  };

  const requiredPermissions = routePermissions[route] || [];
  return requiredPermissions.some(perm => founder.permissions.includes(perm));
}
