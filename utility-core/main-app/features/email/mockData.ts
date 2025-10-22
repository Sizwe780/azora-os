/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Mail, Send, Inbox, Star, Trash2 } from 'lucide-react';

export const mockEmails = [
  { id: '1', from: 'notifications@vercel.com', from_avatar: 'V', subject: 'Deployment Successful: azora-os-main', body: 'Your project Azora OS (main) was just deployed to production. Visit: https://azora-os.vercel.app', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, starred: true, folder: 'inbox', attachments: [] },
  { id: '2', from: 'support@github.com', from_avatar: 'G', subject: 'New issue opened in azoraworld/azora-os', body: 'A new issue (#137) was opened by @sizwe780: "UI needs a premium overhaul".', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: false, starred: false, folder: 'inbox', attachments: [] },
  { id: '3', from: 'hr@azora.co.za', from_avatar: 'A', subject: 'Company-Wide All Hands Meeting', body: 'Reminder: The Q4 All Hands meeting is scheduled for this Friday at 10:00 AM SAST. Please be there.', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true, starred: false, folder: 'inbox', attachments: [{ id: 'att1', filename: 'agenda.pdf', size: 128000, url: '#' }] },
  { id: '4', from: 'Sizwe Mkhize', from_avatar: 'S', subject: 'Re: Project Phoenix Updates', body: 'Thanks for the update. The new designs look promising. Let\'s sync up tomorrow to discuss the next steps.', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), read: true, starred: true, folder: 'inbox', attachments: [] },
  { id: '5', from: 'legal@azora.co.za', from_avatar: 'A', subject: 'Action Required: Updated Compliance Documents', body: 'Please review and sign the updated compliance documents by EOD Friday.', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), read: true, starred: false, folder: 'inbox', attachments: [{ id: 'att2', filename: 'compliance_policy_v3.docx', size: 45000, url: '#' }] },
  { id: '6', to: 'team@azora.co.za', from: 'you', from_avatar: 'Y', subject: 'Weekly Report', body: 'Here is my weekly report.', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), read: true, starred: false, folder: 'sent', attachments: [] },
  { id: '7', from: 'spam@example.com', from_avatar: 'S', subject: 'You won a prize!', body: 'Click here to claim your prize!', timestamp: new Date().toISOString(), read: true, starred: false, folder: 'trash', attachments: [] },
];

export type Email = typeof mockEmails[0];
export type FolderName = 'inbox' | 'sent' | 'starred' | 'trash';

export const folders = [
    { name: 'inbox', icon: Inbox },
    { name: 'sent', icon: Send },
    { name: 'starred', icon: Star },
    { name: 'trash', icon: Trash2 },
];
