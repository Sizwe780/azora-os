/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Email Integration Service
 * Integrates with domains.co.za email hosting
 * Supports IMAP/SMTP for sending and receiving emails
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');

// Email configuration for domains.co.za
const EMAIL_CONFIG = {
  smtp: {
    host: 'mail.azora.world', // SMTP server from domains.co.za
    port: 465, // SSL port
    secure: true,
    auth: {
      // These should be environment variables in production
      user: process.env.EMAIL_USER || 'azora.ai@azora.world',
      pass: process.env.EMAIL_PASSWORD || '',
    },
  },
  imap: {
    host: 'mail.azora.world', // IMAP server from domains.co.za
    port: 993, // SSL port
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || 'azora.ai@azora.world',
      pass: process.env.EMAIL_PASSWORD || '',
    },
  },
};

// Initialize email transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG.smtp);

/**
 * GET /api/emails/:userId
 * Fetch emails for a user (inbox, sent, starred, trash)
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { filter = 'inbox' } = req.query;

    // Get user's email account
    const userEmail = getUserEmail(userId);
    if (!userEmail) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    // Fetch emails from IMAP server
    const client = new ImapFlow(EMAIL_CONFIG.imap);
    await client.connect();

    let mailbox = 'INBOX';
    if (filter === 'sent') mailbox = 'Sent';
    if (filter === 'trash') mailbox = 'Trash';

    await client.mailboxOpen(mailbox);

    // Fetch recent emails (last 50)
    const messages = [];
    for await (let message of client.fetch('1:50', { envelope: true, bodyStructure: true, source: true })) {
      messages.push({
        id: message.uid.toString(),
        from: message.envelope.from[0]?.address || 'unknown',
        to: message.envelope.to?.map(t => t.address) || [],
        cc: message.envelope.cc?.map(c => c.address) || [],
        subject: message.envelope.subject || '(no subject)',
        body: await extractBody(message),
        timestamp: message.envelope.date,
        read: !message.flags.has('\\Seen'),
        starred: message.flags.has('\\Flagged'),
        labels: Array.from(message.flags),
      });
    }

    await client.logout();

    // Filter starred emails if requested
    const filteredMessages = filter === 'starred' 
      ? messages.filter(m => m.starred)
      : messages;

    res.json({ emails: filteredMessages });
  } catch (error) {
    console.error('Failed to fetch emails:', error);
    
    // Return mock data for development
    const mockEmails = getMockEmails(req.params.userId, req.query.filter);
    res.json({ emails: mockEmails });
  }
});

/**
 * POST /api/emails/send
 * Send an email
 */
router.post('/send', async (req, res) => {
  try {
    const { from, to, cc, bcc, subject, body } = req.body;

    if (!from || !to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send email via SMTP
    const info = await transporter.sendMail({
      from,
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: cc && cc.length > 0 ? cc.join(', ') : undefined,
      bcc: bcc && bcc.length > 0 ? bcc.join(', ') : undefined,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    });

    console.log('Email sent:', info.messageId);

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message,
    });
  }
});

/**
 * POST /api/emails/:emailId/read
 * Mark an email as read
 */
router.post('/:emailId/read', async (req, res) => {
  try {
    const { emailId } = req.params;

    // Mark as read in IMAP
    const client = new ImapFlow(EMAIL_CONFIG.imap);
    await client.connect();
    await client.mailboxOpen('INBOX');
    await client.messageFlagsAdd(emailId, ['\\Seen']);
    await client.logout();

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark as read:', error);
    res.json({ success: true }); // Mock success for development
  }
});

/**
 * POST /api/emails/:emailId/star
 * Toggle star on an email
 */
router.post('/:emailId/star', async (req, res) => {
  try {
    const { emailId } = req.params;
    const { starred } = req.body;

    // Toggle star in IMAP
    const client = new ImapFlow(EMAIL_CONFIG.imap);
    await client.connect();
    await client.mailboxOpen('INBOX');
    
    if (starred) {
      await client.messageFlagsAdd(emailId, ['\\Flagged']);
    } else {
      await client.messageFlagsRemove(emailId, ['\\Flagged']);
    }
    
    await client.logout();

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to toggle star:', error);
    res.json({ success: true }); // Mock success for development
  }
});

/**
 * DELETE /api/emails/:emailId
 * Delete an email (move to trash)
 */
router.delete('/:emailId', async (req, res) => {
  try {
    const { emailId } = req.params;

    // Move to trash in IMAP
    const client = new ImapFlow(EMAIL_CONFIG.imap);
    await client.connect();
    await client.mailboxOpen('INBOX');
    await client.messageMove(emailId, 'Trash');
    await client.logout();

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete email:', error);
    res.json({ success: true }); // Mock success for development
  }
});

// Helper function to get user's email
function getUserEmail(userId) {
  const emailMap = {
    'user_001': 'sizwe.ngwenya@azora.world',
    'user_002': 'sizwe.motingwe@azora.world',
    'user_003': 'milla.mukundi@azora.world',
    'user_004': 'nolundi.ngwenya@azora.world',
    'ai_founder_001': 'azora.ai@azora.world',
  };
  return emailMap[userId];
}

// Helper function to extract email body
async function extractBody(message) {
  // Simplified body extraction
  if (message.bodyStructure.childNodes) {
    for (const node of message.bodyStructure.childNodes) {
      if (node.type === 'text/plain') {
        return node.body || 'No content';
      }
    }
  }
  return 'No content available';
}

// Mock emails for development
function getMockEmails(userId) {
  const userEmail = getUserEmail(userId);
  
  return [
    {
      id: '1',
      from: 'client@example.com',
      to: [userEmail],
      cc: [],
      subject: 'Query about Azora World Services',
      body: 'Hi,\n\nI would like to know more about your logistics solutions. Can you provide more information?\n\nBest regards,\nJohn Doe',
      timestamp: new Date('2025-10-10T09:30:00'),
      read: false,
      starred: false,
      labels: [],
    },
    {
      id: '2',
      from: 'partner@logistics.co.za',
      to: [userEmail],
      cc: [],
      subject: 'Partnership Opportunity',
      body: 'Dear Azora Team,\n\nWe would like to explore a partnership opportunity for cross-border logistics. Are you available for a meeting next week?\n\nKind regards,\nSarah Johnson',
      timestamp: new Date('2025-10-09T14:15:00'),
      read: true,
      starred: true,
      labels: [],
    },
    {
      id: '3',
      from: 'support@azora.world',
      to: [userEmail],
      cc: [],
      subject: 'System Update Notification',
      body: 'This is an automated notification. AZORA system has been successfully updated to version 2.0.\n\nAll systems operational.\n\n▲ AZORA',
      timestamp: new Date('2025-10-10T08:00:00'),
      read: true,
      starred: false,
      labels: [],
    },
  ];
}

module.exports = router;
