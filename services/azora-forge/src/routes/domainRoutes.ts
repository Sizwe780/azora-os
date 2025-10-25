/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import DomainListing from '../models/Domain';
import { customMetrics } from '../middleware/metrics';
import { registrationRateLimiter } from '../middleware/rateLimiter';
import logger from '../utils/logger';
import * as dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

const router = Router();

// Note: AuthenticatedRequest is defined globally via Express namespace extension
type AuthenticatedRequest = Request;

// Middleware for registration rate limiting
const registrationRateLimitMiddleware = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  try {
    const userId = req.user?.id || req.ip || 'anonymous';
    await registrationRateLimiter.consume(userId);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many registration attempts, please try again later.',
        statusCode: 429
      }
    });
  }
};

/**
 * @swagger
 * /api/v1/domains/check:
 *   post:
 *     summary: Check domain availability
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *             properties:
 *               domain:
 *                 type: string
 *                 example: "example.com"
 *     responses:
 *       200:
 *         description: Domain availability checked successfully
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
 *                     domain:
 *                       type: string
 *                       example: "example.com"
 *                     available:
 *                       type: boolean
 *                       example: true
 *                     registered:
 *                       type: boolean
 *                       example: false
 */
router.post('/check', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Domain name is required'
      });
    }

    // Normalize domain
    const normalizedDomain = domain.toLowerCase().trim();

    // Check if domain exists in our database
    const existingListing = await DomainListing.findOne({ domain: normalizedDomain });

    // Check DNS resolution
    let dnsAvailable = false;
    try {
      await dnsLookup(normalizedDomain);
      dnsAvailable = true;
    } catch (error) {
      dnsAvailable = false;
    }

    // Domain is available if:
    // 1. Not in our database, OR
    // 2. In database but marked as available
    const available = !existingListing || existingListing.status === 'available';

    customMetrics.listingsCreatedTotal.inc();

    res.json({
      success: true,
      data: {
        domain: normalizedDomain,
        available,
        registered: !!existingListing,
        dnsResolved: dnsAvailable,
        status: existingListing?.status || 'available'
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

/**
 * @swagger
 * /api/v1/domains/register:
 *   post:
 *     summary: Register a new domain
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *             properties:
 *               domain:
 *                 type: string
 *                 example: "example.com"
 *               category:
 *                 type: string
 *                 example: "technology"
 *               description:
 *                 type: string
 *                 example: "A great domain for tech companies"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tech", "startup"]
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
 *                   $ref: '#/components/schemas/DomainListing'
 */
router.post('/register', registrationRateLimitMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, category, description, tags } = req.body;
    const userId = req.user?.id || 'anonymous';

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Domain name is required'
      });
    }

    // Normalize domain
    const normalizedDomain = domain.toLowerCase().trim();

    // Check if domain already exists
    const existingDomain = await DomainListing.findOne({ domain: normalizedDomain });
    if (existingDomain) {
      return res.status(409).json({
        success: false,
        message: 'Domain already exists'
      });
    }

    // Create domain listing
    const domainListing = new DomainListing({
      domain: normalizedDomain,
      owner: userId,
      status: 'available',
      category,
      description,
      tags,
      views: 0,
      inquiries: 0
    });

    await domainListing.save();

    customMetrics.domainsListedTotal.inc();

    res.status(201).json({
      success: true,
      data: domainListing
    });
  } catch (error: any) {
    logger.error('Error registering domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register domain',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/domains/{domain}:
 *   get:
 *     summary: Get domain details
 *     tags: [Domains]
 *     parameters:
 *       - in: path
 *         name: domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain name
 *     responses:
 *       200:
 *         description: Domain details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DomainListing'
 */
router.get('/:domain', async (req: Request, res: Response) => {
  try {
    const { domain } = req.params;
    const normalizedDomain = domain.toLowerCase().trim();

    const domainListing = await DomainListing.findOne({ domain: normalizedDomain });

    if (!domainListing) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // Increment view count
    domainListing.views += 1;
    await domainListing.save();

    res.json({
      success: true,
      data: domainListing
    });
  } catch (error: any) {
    logger.error('Error fetching domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch domain',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/domains/{domain}:
 *   put:
 *     summary: Update domain details
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Domain updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DomainListing'
 */
router.put('/:domain', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain } = req.params;
    const { category, description, tags } = req.body;
    const userId = req.user?.id || 'anonymous';

    const normalizedDomain = domain.toLowerCase().trim();

    const domainListing = await DomainListing.findOne({
      domain: normalizedDomain,
      owner: userId
    });

    if (!domainListing) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found or access denied'
      });
    }

    // Update fields
    if (category !== undefined) domainListing.category = category;
    if (description !== undefined) domainListing.description = description;
    if (tags !== undefined) domainListing.tags = tags;

    await domainListing.save();

    res.json({
      success: true,
      data: domainListing
    });
  } catch (error: any) {
    logger.error('Error updating domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update domain',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/domains/{domain}:
 *   delete:
 *     summary: Delete domain listing
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain name
 *     responses:
 *       200:
 *         description: Domain deleted successfully
 */
router.delete('/:domain', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain } = req.params;
    const userId = req.user?.id || 'anonymous';

    const normalizedDomain = domain.toLowerCase().trim();

    const domainListing = await DomainListing.findOneAndDelete({
      domain: normalizedDomain,
      owner: userId,
      status: { $in: ['available', 'listed'] }
    });

    if (!domainListing) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found or cannot be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Domain deleted successfully'
    });
  } catch (error: any) {
    logger.error('Error deleting domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete domain',
      error: error.message
    });
  }
});

export default router;