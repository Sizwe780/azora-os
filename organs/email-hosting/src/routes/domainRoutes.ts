/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import Domain from '../models/Domain';
import { customMetrics } from '../middleware/metrics';
import { domainRateLimiter } from '../middleware/rateLimiter';
import logger from '../utils/logger';
import dns from 'dns';
import { promisify } from 'util';

const router = Router();
const dnsResolve = promisify(dns.resolve);

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

// Apply rate limiting
router.use(domainRateLimiter);

/**
 * @swagger
 * /api/v1/domains:
 *   get:
 *     summary: Get all domains for the authenticated user
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, suspended, expired]
 *         description: Filter by domain status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of domains to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of domains to skip
 *     responses:
 *       200:
 *         description: List of domains retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Domain'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const query: any = { owner: userId };
    if (status) {
      query.status = status;
    }

    const domains = await Domain.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await Domain.countDocuments(query);

    customMetrics.domainOperations.inc({ operation: 'list', status: 'success' });

    res.json({
      success: true,
      data: domains,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error: any) {
    logger.error('Error fetching domains:', error);
    customMetrics.domainOperations.inc({ operation: 'list', status: 'error' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch domains',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/domains/{id}:
 *   get:
 *     summary: Get a specific domain by ID
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain ID
 *     responses:
 *       200:
 *         description: Domain retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Domain'
 *       404:
 *         description: Domain not found
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const domain = await Domain.findOne({ _id: id, owner: userId });

    if (!domain) {
      customMetrics.domainOperations.inc({ operation: 'get', status: 'not_found' });
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    customMetrics.domainOperations.inc({ operation: 'get', status: 'success' });

    res.json({
      success: true,
      data: domain
    });
  } catch (error: any) {
    logger.error('Error fetching domain:', error);
    customMetrics.domainOperations.inc({ operation: 'get', status: 'error' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch domain',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/domains:
 *   post:
 *     summary: Register a new domain
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Domain name to register
 *                 example: "example.com"
 *               smtpConfig:
 *                 $ref: '#/components/schemas/SMTPConfig'
 *     responses:
 *       201:
 *         description: Domain registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Domain'
 *                 message:
 *                   type: string
 *                   example: "Domain registered successfully. Please verify ownership by adding the DNS TXT record."
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, smtpConfig } = req.body;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    // Check if domain already exists
    const existingDomain = await Domain.findOne({ name: name.toLowerCase() });
    if (existingDomain) {
      customMetrics.domainOperations.inc({ operation: 'create', status: 'conflict' });
      return res.status(409).json({
        success: false,
        message: 'Domain already registered'
      });
    }

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15);

    const domain = new Domain({
      name: name.toLowerCase(),
      owner: userId,
      smtpConfig: smtpConfig || {},
      verificationToken,
      status: 'pending'
    });

    await domain.save();

    customMetrics.domainOperations.inc({ operation: 'create', status: 'success' });

    res.status(201).json({
      success: true,
      data: domain,
      message: `Domain registered successfully. Please verify ownership by adding the DNS TXT record: azora-verify=${verificationToken}`
    });
  } catch (error: any) {
    logger.error('Error registering domain:', error);
    customMetrics.domainOperations.inc({ operation: 'create', status: 'error' });
    res.status(500).json({
      success: false,
      message: 'Failed to register domain',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/domains/{id}/verify:
 *   post:
 *     summary: Verify domain ownership
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain ID
 *     responses:
 *       200:
 *         description: Domain verified successfully
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
 *                   example: "Domain verified successfully"
 */
router.post('/:id/verify', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const domain = await Domain.findOne({ _id: id, owner: userId });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    if (domain.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Domain already verified'
      });
    }

    // Check DNS TXT record for verification
    try {
      const records = await dnsResolve(`${domain.name}`, 'TXT');
      const verificationRecord = records.find((record: string[]) =>
        record.some(r => r.includes(`azora-verify=${domain.verificationToken}`))
      );

      if (!verificationRecord) {
        customMetrics.domainOperations.inc({ operation: 'verify', status: 'failed' });
        return res.status(400).json({
          success: false,
          message: 'Verification failed. Please ensure the DNS TXT record is properly configured.',
          expectedRecord: `azora-verify=${domain.verificationToken}`
        });
      }

      // Mark domain as active
      domain.status = 'active';
      domain.verifiedAt = new Date();
      await domain.save();

      customMetrics.domainOperations.inc({ operation: 'verify', status: 'success' });

      res.json({
        success: true,
        message: 'Domain verified successfully'
      });
    } catch (dnsError: any) {
      customMetrics.domainOperations.inc({ operation: 'verify', status: 'dns_error' });
      res.status(400).json({
        success: false,
        message: 'DNS lookup failed. Please ensure the domain is properly configured.',
        error: dnsError.message
      });
    }
  } catch (error: any) {
    logger.error('Error verifying domain:', error);
    customMetrics.domainOperations.inc({ operation: 'verify', status: 'error' });
    res.status(500).json({
      success: false,
      message: 'Failed to verify domain',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/domains/{id}/dns:
 *   put:
 *     summary: Update DNS records for a domain
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dnsRecords:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/DNSRecord'
 *     responses:
 *       200:
 *         description: DNS records updated successfully
 */
router.put('/:id/dns', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dnsRecords } = req.body;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const domain = await Domain.findOne({ _id: id, owner: userId });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    if (domain.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Domain must be verified before updating DNS records'
      });
    }

    domain.dnsRecords = dnsRecords;
    await domain.save();

    customMetrics.domainOperations.inc({ operation: 'update_dns', status: 'success' });

    res.json({
      success: true,
      message: 'DNS records updated successfully',
      data: domain
    });
  } catch (error: any) {
    logger.error('Error updating DNS records:', error);
    customMetrics.domainOperations.inc({ operation: 'update_dns', status: 'error' });
    res.status(500).json({
      success: false,
      message: 'Failed to update DNS records',
      error: error.message
    });
  }
});

router.put('/:id/smtp', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { smtpConfig } = req.body;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const domain = await Domain.findOne({ _id: id, owner: userId });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    domain.smtpConfig = { ...domain.smtpConfig, ...smtpConfig };
    await domain.save();

    customMetrics.domainOperations.inc({ operation: 'update_smtp', status: 'success' });

    res.json({
      success: true,
      message: 'SMTP configuration updated successfully',
      data: domain
    });
  } catch (error: any) {
    logger.error('Error updating SMTP configuration:', error);
    customMetrics.domainOperations.inc({ operation: 'update_smtp', status: 'error' });
    res.status(500).json({
      success: false,
      message: 'Failed to update SMTP configuration',
      error: error.message
    });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const domain = await Domain.findOneAndDelete({ _id: id, owner: userId });

    if (!domain) {
      customMetrics.domainOperations.inc({ operation: 'delete', status: 'not_found' });
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    customMetrics.domainOperations.inc({ operation: 'delete', status: 'success' });

    res.json({
      success: true,
      message: 'Domain deleted successfully'
    });
  } catch (error: any) {
    logger.error('Error deleting domain:', error);
    customMetrics.domainOperations.inc({ operation: 'delete', status: 'error' });
    res.status(500).json({
      success: false,
      message: 'Failed to delete domain',
      error: error.message
    });
  }
});

router.get('/check/:domain', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain } = req.params;
    const domainName = domain.toLowerCase();

    // Check if domain exists in our database
    const existingDomain = await Domain.findOne({ name: domainName });

    // Check DNS resolution
    let dnsResolves = false;
    try {
      await dnsResolve(domainName, 'A');
      dnsResolves = true;
    } catch (error) {
      // Domain doesn't resolve, which is good for registration
    }

    const available = !existingDomain && !dnsResolves;

    customMetrics.dnsLookups.inc({ type: 'availability_check', result: available ? 'available' : 'unavailable' });

    res.json({
      success: true,
      data: {
        domain: domainName,
        available,
        registered: !!existingDomain,
        dnsResolves
      }
    });
  } catch (error: any) {
    logger.error('Error checking domain availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check domain availability',
      error: error.message
    });
  }
});


export default router;