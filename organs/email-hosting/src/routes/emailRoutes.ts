/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import Email from '../models/Email'; // Assuming Email model has .canRetry()
import Domain from '../models/Domain'; // Assuming Domain model has smtpConfig
import { customMetrics } from '../middleware/metrics';
import { emailRateLimiter } from '../middleware/rateLimiter';
import logger from '../utils/logger';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

// TODO: ADD AUTHENTICATION MIDDLEWARE HERE globally for this router
// Example: router.use(yourAuthMiddleware);

// Apply rate limiting to all routes in this file
router.use(emailRateLimiter);

/**
 * @swagger
 * /api/v1/emails:
 *   post:
 *     summary: Send an email
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Email'
 *     responses:
 *       202:
 *         description: Email queued for sending
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email queued for sending"
 *                 data:
 *                   $ref: '#/components/schemas/Email'
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { to, cc, bcc, subject, text, html, attachments, priority, scheduledAt, domain } = req.body;
    
    // Enforce authentication. This should fail if auth middleware is missing.
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const userId = req.user.id;

    // Validate required fields
    if (!to || !subject || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, domain'
      });
    }

    // Validate domain ownership
    const domainDoc = await Domain.findOne({ name: domain, owner: userId, status: 'active' });
    if (!domainDoc) {
      return res.status(400).json({
        success: false,
        message: 'Domain not found, not verified, or not active'
      });
    }

    // Convert base64 attachments to Buffers for database storage
    const processedAttachments = attachments?.map((att: any) => ({
      filename: att.filename,
      content: Buffer.from(att.content, 'base64'), // Convert base64 string to Buffer
      contentType: att.contentType
    }));

    // Create email document
    const email = new Email({
      messageId: uuidv4(),
      from: `noreply@${domain}`,
      to: Array.isArray(to) ? to : [to],
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      subject,
      text,
      html,
      attachments: processedAttachments,
      priority: priority || 'normal',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      domain,
      userId
    });

    await email.save();

    customMetrics.emailsQueued.inc();

    // NOTE: setImmediate is not a durable queue. If the process crashes,
    // this email will be lost. A proper queue (e.g., BullMQ, RabbitMQ) is required.
    setImmediate(() => sendEmail(email, domainDoc));

    res.status(202).json({
      success: true,
      message: 'Email queued for sending',
      data: {
        id: email._id,
        messageId: email.messageId
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error queuing email:', { error: message });
    res.status(500).json({
      success: false,
      message: 'Failed to queue email',
      error: message
    });
  }
});

/**
 * @swagger
 * /api/v1/emails:
 *   get:
 *     summary: Get emails for the authenticated user
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [queued, sending, sent, delivered, bounced, failed]
 *         description: Filter by email status
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         description: Filter by domain
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of emails to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of emails to skip
 *     responses:
 *       200:
 *         description: List of emails retrieved successfully
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, domain, limit = 20, offset = 0 } = req.query;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const userId = req.user.id;

    const query: any = { userId };
    if (status) query.status = status as string;
    if (domain) query.domain = domain as string;

    const emails = await Email.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await Email.countDocuments(query);

    res.json({
      success: true,
      data: emails,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error fetching emails:', { error: message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emails',
      error: message
    });
  }
});

/**
 * @swagger
 * /api/v1/emails/stats/summary:
 *   get:
 *     summary: Get email statistics summary
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         description: Filter by domain
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Email statistics retrieved successfully
 */
router.get('/stats/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, days = 30 } = req.query;
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const userId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const matchQuery: any = {
      userId,
      createdAt: { $gte: startDate }
    };

    if (domain) {
      matchQuery.domain = domain as string;
    }

    const stats = await Email.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const statsMap = stats.reduce((map, stat) => {
      map[stat._id] = stat.count;
      return map;
    }, {});

    res.json({
      success: true,
      data: {
        total,
        sent: statsMap.sent || 0,
        delivered: statsMap.delivered || 0,
        bounced: statsMap.bounced || 0,
        failed: statsMap.failed || 0,
        queued: statsMap.queued || 0,
        sending: statsMap.sending || 0,
        period: `${days} days`
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error fetching email stats:', { error: message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email statistics',
      error: message
    });
  }
});

/**
 * @swagger
 * /api/v1/emails/{id}:
 *   get:
 *     summary: Get a specific email by ID
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email ID
 *     responses:
 *       200:
 *         description: Email retrieved successfully
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const userId = req.user.id;

    const email = await Email.findOne({ _id: id, userId });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    res.json({
      success: true,
      data: email
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error fetching email:', { error: message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email',
      error: message
    });
  }
});

/**
 * @swagger
 * /api/v1/emails/{id}/resend:
 *   post:
 *     summary: Resend a failed email
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email ID
 *     responses:
 *       202:
 *         description: Email queued for resending
 */
router.post('/:id/resend', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const userId = req.user.id;

    const email = await Email.findOne({ _id: id, userId });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    if (email.status !== 'failed' && email.status !== 'bounced') {
      return res.status(400).json({
        success: false,
        message: 'Email is not in a failed or bounced state'
      });
    }

    // This assumes `canRetry()` is an instance method on your Email schema
    if (!(email as any).canRetry()) {
      return res.status(400).json({
        success: false,
        message: 'Maximum retry attempts exceeded'
      });
    }

    // Reset email status and queue for sending
    email.status = 'queued'; // Set to 'queued' to re-enter the processing state
    email.errorMessage = undefined;
    // You might want to increment a retry counter here, e.g., email.retries += 1;
    await email.save();

    // Get domain configuration
    const domain = await Domain.findOne({ name: email.domain, owner: userId, status: 'active' });
    if (!domain) {
      // Even if domain is gone, we queued it. But we can't send it.
      // Mark as failed again.
      email.status = 'failed';
      email.errorMessage = 'Domain configuration not found or not active';
      await email.save();
      
      return res.status(400).json({
        success: false,
        message: 'Domain configuration not found'
      });
    }

    // Queue email for sending
    setImmediate(() => sendEmail(email, domain));

    res.status(202).json({
      success: true,
      message: 'Email queued for resending'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error resending email:', { error: message });
    res.status(500).json({
      success: false,
      message: 'Failed to resend email',
      error: message
    });
  }
});

/**
 * @swagger
 * /api/v1/emails/{id}:
 *   delete:
 *     summary: Delete an email
 *     tags: [Emails]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email ID
 *     responses:
 *       200:
 *         description: Email deleted successfully
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const userId = req.user.id;

    const email = await Email.findOneAndDelete({ _id: id, userId });

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    res.json({
      success: true,
      message: 'Email deleted successfully'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error deleting email:', { error: message });
    res.status(500).json({
      success: false,
      message: 'Failed to delete email',
      error: message
    });
  }
});


// Helper function to send email
async function sendEmail(email: any, domain: any) {
  try {
    // Update status to 'sending' only when the worker picks it up
    email.status = 'sending';
    await email.save();

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: domain.smtpConfig.host,
      port: domain.smtpConfig.port,
      secure: domain.smtpConfig.secure, // true for 465, false for other ports
      auth: {
        user: domain.smtpConfig.username,
        pass: domain.smtpConfig.password
      },
      // DKIM configuration
      dkim: domain.smtpConfig.dkim?.enabled ? {
        domainName: domain.name,
        keySelector: domain.smtpConfig.dkim.selector,
        privateKey: domain.smtpConfig.dkim.privateKey
      } : undefined
    });

    // Prepare email options
    const mailOptions = {
      from: email.from,
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      subject: email.subject,
      text: email.text,
      html: email.html,
      attachments: email.attachments?.map((att: any) => ({
        filename: att.filename,
        content: att.content, // Pass the Buffer directly
        contentType: att.contentType
      })),
      messageId: `<${email.messageId}@${domain.name}>`,
      priority: email.priority
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Update email status
    email.markAsSent(); // Assumes this method exists on the model
    await email.save();

    customMetrics.emailsSent.inc({ status: 'sent', domain: domain.name });

    logger.info('Email sent successfully:', {
      messageId: email.messageId,
      messageIdSMTP: info.messageId
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to send email:', {
      messageId: email.messageId,
      error: message
    });

    // Update email status
    email.markAsFailed(message); // Assumes this method exists on the model
    await email.save();

    customMetrics.emailsSent.inc({ status: 'failed', domain: domain.name });
  }
}

export default router;