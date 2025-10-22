/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import Domain, { IDNSRecord } from '../models/Domain';
import { customMetrics } from '../middleware/metrics';
import { smtpRateLimiter } from '../middleware/rateLimiter';
import logger from '../utils/logger';
import nodemailer from 'nodemailer';

const router = Router();

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

// Apply rate limiting
router.use(smtpRateLimiter);

/**
 * @swagger
 * /api/v1/smtp/test:
 *   post:
 *     summary: Test SMTP configuration
 *     tags: [SMTP]
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
 *               - host
 *               - port
 *               - username
 *               - password
 *             properties:
 *               host:
 *                 type: string
 *                 example: "smtp.gmail.com"
 *               port:
 *                 type: integer
 *                 example: 587
 *               secure:
 *                 type: boolean
 *                 example: false
 *               username:
 *                 type: string
 *                 example: "user@gmail.com"
 *               password:
 *                 type: string
 *                 example: "app-password"
 *               domain:
 *                 type: string
 *                 description: Domain name for testing
 *     responses:
 *       200:
 *         description: SMTP configuration tested successfully
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
 *                   example: "SMTP connection successful"
 *                 details:
 *                   type: object
 *                   properties:
 *                     authenticated:
 *                       type: boolean
 *                     response:
 *                       type: string
 */
router.post('/test', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { host, port, secure, username, password, domain } = req.body;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: username,
        pass: password
      },
      // Add domain-specific configuration if provided
      ...(domain && {
        tls: {
          rejectUnauthorized: false // For testing purposes
        }
      })
    });

    // Test connection
    const testResult = await transporter.verify();

    customMetrics.smtpConnections.inc();

    res.json({
      success: true,
      message: 'SMTP connection successful',
      details: {
        authenticated: true,
        response: 'Connection established successfully'
      }
    });
  } catch (error: any) {
    logger.error('SMTP test failed:', error);
    res.status(400).json({
      success: false,
      message: 'SMTP connection failed',
      error: error.message,
      details: {
        authenticated: false,
        response: error.message
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/smtp/domains/{domainId}/config:
 *   get:
 *     summary: Get SMTP configuration for a domain
 *     tags: [SMTP]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: domainId
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain ID
 *     responses:
 *       200:
 *         description: SMTP configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SMTPConfig'
 */
router.get('/domains/:domainId/config', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domainId } = req.params;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const domain = await Domain.findOne({ _id: domainId, owner: userId });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    res.json({
      success: true,
      data: domain.smtpConfig
    });
  } catch (error: any) {
    logger.error('Error fetching SMTP config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SMTP configuration',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/smtp/domains/{domainId}/config:
 *   put:
 *     summary: Update SMTP configuration for a domain
 *     tags: [SMTP]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: domainId
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
 *               smtpConfig:
 *                 $ref: '#/components/schemas/SMTPConfig'
 *     responses:
 *       200:
 *         description: SMTP configuration updated successfully
 */
router.put('/domains/:domainId/config', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domainId } = req.params;
    const { smtpConfig } = req.body;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const domain = await Domain.findOne({ _id: domainId, owner: userId });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // Validate SMTP config
    if (smtpConfig.host && smtpConfig.port) {
      // Test the configuration
      try {
        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure || false,
          auth: smtpConfig.username && smtpConfig.password ? {
            user: smtpConfig.username,
            pass: smtpConfig.password
          } : undefined
        });

        await transporter.verify();
      } catch (testError: any) {
        return res.status(400).json({
          success: false,
          message: 'SMTP configuration validation failed',
          error: testError.message
        });
      }
    }

    domain.smtpConfig = { ...domain.smtpConfig, ...smtpConfig };
    await domain.save();

    res.json({
      success: true,
      message: 'SMTP configuration updated successfully',
      data: domain.smtpConfig
    });
  } catch (error: any) {
    logger.error('Error updating SMTP config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SMTP configuration',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/smtp/domains/{domainId}/dkim:
 *   post:
 *     summary: Generate DKIM keys for a domain
 *     tags: [SMTP]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: domainId
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selector:
 *                 type: string
 *                 default: "azora"
 *                 description: DKIM selector
 *               keySize:
 *                 type: integer
 *                 enum: [1024, 2048]
 *                 default: 2048
 *                 description: DKIM key size
 *     responses:
 *       200:
 *         description: DKIM keys generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     selector:
 *                       type: string
 *                       example: "azora"
 *                     publicKey:
 *                       type: string
 *                       description: DKIM public key
 *                     privateKey:
 *                       type: string
 *                       description: DKIM private key (keep secure)
 *                     dnsRecord:
 *                       type: string
 *                       description: DNS TXT record to add
 */
router.post('/domains/:domainId/dkim', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domainId } = req.params;
    const { selector = 'azora', keySize = 2048 } = req.body;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const domain = await Domain.findOne({ _id: domainId, owner: userId });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // Generate DKIM key pair (simplified - in production use crypto module)
    const crypto = await import('crypto');
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: keySize,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Format public key for DNS
    const publicKeyDNS = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\n/g, '');

    const dnsRecord = `${selector}._domainkey.${domain.name} IN TXT "v=DKIM1; k=rsa; p=${publicKeyDNS}"`;

    // Update domain SMTP config
    domain.smtpConfig.dkim = {
      enabled: true,
      selector,
      privateKey
    };

    await domain.save();

    res.json({
      success: true,
      message: 'DKIM keys generated successfully',
      data: {
        selector,
        publicKey,
        privateKey,
        dnsRecord
      }
    });
  } catch (error: any) {
    logger.error('Error generating DKIM keys:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate DKIM keys',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/smtp/domains/{domainId}/spf:
 *   post:
 *     summary: Generate SPF record for a domain
 *     tags: [SMTP]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: domainId
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               include:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Additional domains to include in SPF
 *                 example: ["_spf.google.com", "mailgun.org"]
 *               policy:
 *                 type: string
 *                 enum: ["-all", "~all", "?all"]
 *                 default: "-all"
 *                 description: SPF policy (-all = strict, ~all = soft fail, ?all = neutral)
 *     responses:
 *       200:
 *         description: SPF record generated successfully
 */
router.post('/domains/:domainId/spf', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domainId } = req.params;
    const { include = [], policy = '-all' } = req.body;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const domain = await Domain.findOne({ _id: domainId, owner: userId });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // Generate SPF record
    const spfParts = ['v=spf1'];
    include.forEach((domain: string) => spfParts.push(`include:${domain}`));
    spfParts.push(policy);

    const spfRecord = spfParts.join(' ');

    // Update domain SMTP config
    domain.smtpConfig.spf = spfRecord;
    await domain.save();

    // Add SPF TXT record to DNS records
    const spfDNSRecord: IDNSRecord = {
      type: 'TXT',
      name: domain.name,
      value: spfRecord,
      ttl: 3600
    };

    // Check if SPF record already exists
    const existingSPF = domain.dnsRecords.find(record =>
      record.type === 'TXT' && record.name === domain.name && record.value.includes('v=spf1')
    );

    if (!existingSPF) {
      domain.dnsRecords.push(spfDNSRecord);
      await domain.save();
    }

    res.json({
      success: true,
      message: 'SPF record generated successfully',
      data: {
        spfRecord,
        dnsRecord: spfDNSRecord
      }
    });
  } catch (error: any) {
    logger.error('Error generating SPF record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate SPF record',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/smtp/domains/{domainId}/dmarc:
 *   post:
 *     summary: Generate DMARC record for a domain
 *     tags: [SMTP]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: domainId
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               policy:
 *                 type: string
 *                 enum: ["none", "quarantine", "reject"]
 *                 default: "quarantine"
 *                 description: DMARC policy
 *               subdomainPolicy:
 *                 type: string
 *                 enum: ["none", "quarantine", "reject"]
 *                 description: Policy for subdomains
 *               percentage:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 default: 100
 *                 description: Percentage of emails to apply policy to
 *               rua:
 *                 type: string
 *                 description: Aggregate report URI
 *               ruf:
 *                 type: string
 *                 description: Forensic report URI
 *     responses:
 *       200:
 *         description: DMARC record generated successfully
 */
router.post('/domains/:domainId/dmarc', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domainId } = req.params;
    const {
      policy = 'quarantine',
      subdomainPolicy,
      percentage = 100,
      rua,
      ruf
    } = req.body;
    const userId = req.user?.id || 'anonymous'; // TODO: Add authentication middleware

    const domain = await Domain.findOne({ _id: domainId, owner: userId });

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // Generate DMARC record
    const dmarcParts = [`v=DMARC1`, `p=${policy}`, `pct=${percentage}`];

    if (subdomainPolicy) {
      dmarcParts.push(`sp=${subdomainPolicy}`);
    }

    if (rua) {
      dmarcParts.push(`rua=mailto:${rua}`);
    }

    if (ruf) {
      dmarcParts.push(`ruf=mailto:${ruf}`);
    }

    const dmarcRecord = dmarcParts.join('; ');

    // Update domain SMTP config
    domain.smtpConfig.dmarc = dmarcRecord;
    await domain.save();

    // Add DMARC TXT record to DNS records
    const dmarcDNSRecord: IDNSRecord = {
      type: 'TXT',
      name: `_dmarc.${domain.name}`,
      value: dmarcRecord,
      ttl: 3600
    };

    // Check if DMARC record already exists
    const existingDMARC = domain.dnsRecords.find(record =>
      record.type === 'TXT' && record.name === `_dmarc.${domain.name}`
    );

    if (!existingDMARC) {
      domain.dnsRecords.push(dmarcDNSRecord);
      await domain.save();
    }

    res.json({
      success: true,
      message: 'DMARC record generated successfully',
      data: {
        dmarcRecord,
        dnsRecord: dmarcDNSRecord
      }
    });
  } catch (error: any) {
    logger.error('Error generating DMARC record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate DMARC record',
      error: error.message
    });
  }
});

export default router;