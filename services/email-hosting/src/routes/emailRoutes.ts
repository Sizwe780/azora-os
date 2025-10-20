import { Router, Request, Response } from 'express';
import Email from '../models/Email';
import Domain from '../models/Domain';
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

// Apply rate limiting
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      from,
      to,
      cc,
      bcc,
      subject,
      text,
      html,
      attachments,
      priority = 'normal',
      scheduledAt
    } = req.body;

    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    // Extract domain from sender email
    const fromDomain = from.split('@')[1]?.toLowerCase();
    if (!fromDomain) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sender email address'
      });
    }

    // Check if domain is registered and active
    const domain = await Domain.findOne({ name: fromDomain, owner: userId, status: 'active' });
    if (!domain) {
      return res.status(403).json({
        success: false,
        message: 'Domain not registered or not verified'
      });
    }

    // Validate SMTP configuration
    if (!domain.smtpConfig.host || !domain.smtpConfig.username || !domain.smtpConfig.password) {
      return res.status(400).json({
        success: false,
        message: 'SMTP configuration incomplete for this domain'
      });
    }

    // Generate unique message ID
    const messageId = uuidv4();

    // Create email record
    const email = new Email({
      messageId,
      from,
      to: Array.isArray(to) ? to : [to],
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      subject,
      text,
      html,
      attachments,
      priority,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      domain: fromDomain,
      userId,
      status: scheduledAt ? 'queued' : 'sending'
    });

    await email.save();

    // Queue email for sending (in production, use a job queue)
    if (!scheduledAt || new Date(scheduledAt) <= new Date()) {
      // Send email immediately
      setImmediate(() => sendEmail(email, domain));
    }

    customMetrics.emailsQueued.inc();

    res.status(202).json({
      success: true,
      message: scheduledAt ? 'Email scheduled for sending' : 'Email queued for sending',
      data: email
    });
  } catch (error) {
    logger.error('Error queuing email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue email',
      error: error.message
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
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, domain, limit = 20, offset = 0 } = req.query;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const query: any = { userId };
    if (status) query.status = status;
    if (domain) query.domain = domain;

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
  } catch (error) {
    logger.error('Error fetching emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emails',
      error: error.message
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
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

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
  } catch (error) {
    logger.error('Error fetching email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email',
      error: error.message
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
router.post('/:id/resend', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

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
        message: 'Email is not in a failed state'
      });
    }

    if (!email.canRetry()) {
      return res.status(400).json({
        success: false,
        message: 'Maximum retry attempts exceeded'
      });
    }

    // Reset email status and queue for sending
    email.status = 'sending';
    email.errorMessage = undefined;
    await email.save();

    // Get domain configuration
    const domain = await Domain.findOne({ name: email.domain, owner: userId, status: 'active' });
    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Domain configuration not found'
      });
    }

    // Send email
    setImmediate(() => sendEmail(email, domain));

    res.status(202).json({
      success: true,
      message: 'Email queued for resending'
    });
  } catch (error) {
    logger.error('Error resending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend email',
      error: error.message
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
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

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
  } catch (error) {
    logger.error('Error deleting email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete email',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/emails/stats:
 *   get:
 *     summary: Get email statistics
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
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const { domain, days = 30 } = req.query;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const matchQuery: any = {
      userId,
      createdAt: { $gte: startDate }
    };

    if (domain) {
      matchQuery.domain = domain;
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
  } catch (error) {
    logger.error('Error fetching email stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email statistics',
      error: error.message
    });
  }
});

// Helper function to send email
async function sendEmail(email: any, domain: any) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: domain.smtpConfig.host,
      port: domain.smtpConfig.port,
      secure: domain.smtpConfig.secure,
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
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType
      })),
      messageId: `<${email.messageId}@${domain.name}>`,
      priority: email.priority
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Update email status
    email.markAsSent();
    await email.save();

    customMetrics.emailsSent.inc({ status: 'sent', domain: domain.name });

    logger.info('Email sent successfully:', {
      messageId: email.messageId,
      messageIdSMTP: info.messageId
    });

  } catch (error) {
    logger.error('Failed to send email:', {
      messageId: email.messageId,
      error: error.message
    });

    // Update email status
    email.markAsFailed(error.message);
    await email.save();

    customMetrics.emailsSent.inc({ status: 'failed', domain: domain.name });
  }
}

export default router;