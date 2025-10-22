/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { subDays, format } from 'date-fns';

export interface Email {
  id: string;
  from: {
    name: string;
    email: string;
    avatar: string;
  };
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'starred';
  starred: boolean;
  read: boolean;
  labels: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Fleet Manager' | 'Compliance Officer' | 'Driver' | 'Manager' | 'Accountant';
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  lastLogin: string;
}

export interface DashboardMetric {
    id: string;
    label: string;
    value: string;
    change: string;
    changeType: 'increase' | 'decrease';
    icon: any; // Lucide icon component
}

const now = new Date();

export const mockEmails: Email[] = [
  {
    id: '1',
    from: { name: 'Fleet Command', email: 'fleet@azora.world', avatar: '/avatars/fleet-command.png' },
    to: 'admin@azora.world',
    subject: 'Urgent: Trip ETA Update for #AZ-789',
    body: `Hi Admin,\n\nPlease note that the estimated time of arrival for trip #AZ-789 has been updated due to unexpected weather conditions. The new ETA is ${format(new Date().setHours(18), 'p')}. Please update the client.\n\nBest,\nFleet Command`,
    timestamp: subDays(now, 0).toISOString(),
    folder: 'inbox',
    starred: true,
    read: false,
    labels: ['Urgent', 'Logistics'],
  },
  {
    id: '2',
    from: { name: 'Compliance Bot', email: 'compliance@azora.world', avatar: '/avatars/compliance-bot.png' },
    to: 'admin@azora.world',
    subject: 'Weekly Compliance Report',
    body: 'Good morning,\n\nThe weekly compliance report is attached. Overall compliance is at 98.7%. One minor infraction was recorded and is under review.\n\nRegards,\nCompliance Bot',
    timestamp: subDays(now, 1).toISOString(),
    folder: 'inbox',
    starred: false,
    read: true,
    labels: ['Report'],
  },
  {
    id: '3',
    from: { name: 'HR AI Deputy', email: 'hr-ai@azora.world', avatar: '/avatars/hr-ai.png' },
    to: 'admin@azora.world',
    subject: 'New Driver Onboarding Complete',
    body: 'This is to confirm that driver John "Maverick" Doe has completed all onboarding procedures and is now active in the system. His profile is available for assignment.\n\nThank you,\nHR AI Deputy',
    timestamp: subDays(now, 2).toISOString(),
    folder: 'inbox',
    starred: false,
    read: true,
    labels: ['HR', 'Onboarding'],
  },
  {
    id: '4',
    from: { name: 'Admin', email: 'admin@azora.world', avatar: '/avatars/admin.png' },
    to: 'sarah@azora.world',
    subject: 'Re: Q3 Financial Projections',
    body: 'Hi Sarah,\n\nThanks for sending those over. The projections look solid. Let\'s schedule a meeting for next week to discuss the details.\n\nBest,\nAdmin',
    timestamp: subDays(now, 1).toISOString(),
    folder: 'sent',
    starred: false,
    read: true,
    labels: [],
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Fleet',
    email: 'sarah@azora.world',
    avatar: '/avatars/sarah.png',
    role: 'Fleet Manager',
    status: 'Active',
    createdAt: subDays(now, 30).toISOString(),
    lastLogin: subDays(now, 0).toISOString(),
  },
  {
    id: '2',
    name: 'John Driver',
    email: 'john@azora.world',
    avatar: '/avatars/john.png',
    role: 'Driver',
    status: 'Active',
    createdAt: subDays(now, 15).toISOString(),
    lastLogin: subDays(now, 1).toISOString(),
  },
  {
    id: '3',
    name: 'Compliance Carl',
    email: 'carl@azora.world',
    avatar: '/avatars/carl.png',
    role: 'Compliance Officer',
    status: 'Active',
    createdAt: subDays(now, 90).toISOString(),
    lastLogin: subDays(now, 0).toISOString(),
  },
  {
    id: '4',
    name: 'Admin User',
    email: 'admin@azora.world',
    avatar: '/avatars/admin-user.png',
    role: 'Admin',
    status: 'Active',
    createdAt: subDays(now, 365).toISOString(),
    lastLogin: subDays(now, 0).toISOString(),
  },
  {
    id: '5',
    name: 'Suspended Sam',
    email: 'sam@azora.world',
    avatar: '/avatars/sam.png',
    role: 'Driver',
    status: 'Suspended',
    createdAt: subDays(now, 60).toISOString(),
    lastLogin: subDays(now, 10).toISOString(),
  },
];

export const FOLDERS = [
    { id: 'inbox', name: 'Inbox', icon: 'Inbox' },
    { id: 'sent', name: 'Sent', icon: 'Send' },
    { id: 'drafts', name: 'Drafts', icon: 'FileText' },
    { id: 'starred', name: 'Starred', icon: 'Star' },
    { id: 'trash', name: 'Trash', icon: 'Trash2' },
];

export const ROLES: User['role'][] = ['Admin', 'Fleet Manager', 'Compliance Officer', 'Driver', 'Manager', 'Accountant'];
