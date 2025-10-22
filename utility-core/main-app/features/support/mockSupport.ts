/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { subDays, subHours } from 'date-fns';

export interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgent: string;
  createdAt: Date;
  lastUpdate: Date;
  messages: { author: string; text: string; timestamp: Date }[];
}

export interface AIAgent {
  name: string;
  specialization: string;
  ticketsHandled: number;
  avgResolutionTime: number; // in hours
  satisfactionScore: number; // percentage
  status: 'online' | 'offline' | 'busy';
}

export interface SupportData {
  tickets: Ticket[];
  agents: AIAgent[];
  totalTickets: number;
  resolvedToday: number;
  avgResolutionTime: number; // in hours
  avgSatisfaction: number; // percentage
}

export const getMockSupportData = (): SupportData => {
  const agents: AIAgent[] = [
    { name: 'Nexus', specialization: 'General Inquiries', ticketsHandled: 124, avgResolutionTime: 2.5, satisfactionScore: 98, status: 'online' },
    { name: 'Cortex', specialization: 'Technical Support', ticketsHandled: 88, avgResolutionTime: 4.1, satisfactionScore: 95, status: 'online' },
    { name: 'Helia', specialization: 'Billing & Subscriptions', ticketsHandled: 72, avgResolutionTime: 1.8, satisfactionScore: 99, status: 'busy' },
    { name: 'Orion', specialization: 'Compliance & Legal', ticketsHandled: 31, avgResolutionTime: 8.5, satisfactionScore: 97, status: 'online' },
  ];

  const tickets: Ticket[] = [
    {
      id: 'TIX-001',
      subject: 'Cannot access quantum dashboard',
      status: 'in-progress',
      priority: 'critical',
      assignedAgent: 'Cortex',
      createdAt: subHours(new Date(), 2),
      lastUpdate: subHours(new Date(), 1),
      messages: [
        { author: 'Client', text: 'I am getting a 503 error.', timestamp: subHours(new Date(), 2) },
        { author: 'Cortex', text: 'I am investigating the issue. It seems to be a service degradation.', timestamp: subHours(new Date(), 1) },
      ]
    },
    {
      id: 'TIX-002',
      subject: 'Invoice #INV-2024-07-12 incorrect',
      status: 'open',
      priority: 'high',
      assignedAgent: 'Helia',
      createdAt: subHours(new Date(), 6),
      lastUpdate: subHours(new Date(), 6),
      messages: [
        { author: 'Client', text: 'The charged amount is higher than my plan.', timestamp: subHours(new Date(), 6) },
      ]
    },
    {
      id: 'TIX-003',
      subject: 'How to enable 2FA?',
      status: 'resolved',
      priority: 'low',
      assignedAgent: 'Nexus',
      createdAt: subDays(new Date(), 1),
      lastUpdate: subHours(new Date(), 22),
      messages: [
        { author: 'Client', text: 'I can\'t find the setting.', timestamp: subDays(new Date(), 1) },
        { author: 'Nexus', text: 'You can find it under Settings > Security. Here is a guide link...', timestamp: subHours(new Date(), 23) },
        { author: 'Client', text: 'Thanks, it worked!', timestamp: subHours(new Date(), 22) },
      ]
    },
    {
      id: 'TIX-004',
      subject: 'Data export for compliance audit',
      status: 'in-progress',
      priority: 'high',
      assignedAgent: 'Orion',
      createdAt: subDays(new Date(), 2),
      lastUpdate: subHours(new Date(), 4),
      messages: [
        { author: 'Client', text: 'I need a full export of user activity for Q2.', timestamp: subDays(new Date(), 2) },
        { author: 'Orion', text: 'This requires generating a large report. I have started the process, it may take a few hours.', timestamp: subHours(new Date(), 4) },
      ]
    },
    {
      id: 'TIX-005',
      subject: 'General question about AI training',
      status: 'closed',
      priority: 'low',
      assignedAgent: 'Nexus',
      createdAt: subDays(new Date(), 3),
      lastUpdate: subDays(new Date(), 3),
      messages: []
    },
  ];

  return {
    tickets,
    agents,
    totalTickets: 156,
    resolvedToday: 12,
    avgResolutionTime: 3.2,
    avgSatisfaction: 97.5,
  };
};
