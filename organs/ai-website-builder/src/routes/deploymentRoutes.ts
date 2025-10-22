/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import { WebsiteDeployment, WebsiteGeneration } from '../models/Website';
import { customMetrics } from '../middleware/metrics';
import { deploymentRateLimiter } from '../middleware/rateLimiter';
import logger from '../utils/logger';
import { deployWebsite } from '../services/deploymentService';

const router = Router();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

type AuthenticatedRequest = Request;

/**
 * @swagger
 * /api/v1/deployment/deploy:
 *   post:
 *     summary: Deploy a website
 *     tags: [Deployment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - websiteId
 *               - subdomain
 *             properties:
 *               websiteId:
 *                 type: string
 *                 description: Website ID to deploy
 *               subdomain:
 *                 type: string
 *                 description: Subdomain for deployment
 *               domain:
 *                 type: string
 *                 description: Custom domain (optional)
 *     responses:
 *       201:
 *         description: Deployment started
 *       400:
 *         description: Invalid request data
 */
router.post('/deploy', deploymentRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { websiteId, subdomain, domain } = req.body;
    const userId = req.user?.id || 'anonymous';

    // Validate website exists and is completed
    const website = await WebsiteGeneration.findOne({
      _id: websiteId,
      status: 'completed',
      ...(userId !== 'anonymous' && { userId }),
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Website not found or not ready for deployment',
          statusCode: 404,
        },
      });
    }

    // Check if subdomain is available
    const existingDeployment = await WebsiteDeployment.findOne({ subdomain });
    if (existingDeployment) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Subdomain is already taken',
          statusCode: 400,
        },
      });
    }

    // Create deployment record
    const deployment = new WebsiteDeployment({
      websiteId,
      userId,
      domain,
      subdomain,
      deploymentUrl: `https://${subdomain}.azora-sites.com`,
      status: 'pending',
    });

    await deployment.save();

    // Start async deployment
    deployWebsite((deployment._id as string)).catch((error) => {
      logger.error('Website deployment failed:', error);
    });

    customMetrics.websitesDeployedTotal.inc();

    res.status(201).json({
      success: true,
      data: {
        deploymentId: deployment._id,
        status: 'deploying',
        deploymentUrl: deployment.deploymentUrl,
        message: 'Website deployment started',
      },
    });
  } catch (error) {
    logger.error('Error starting deployment:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to start deployment',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/deployment/{id}:
 *   get:
 *     summary: Get deployment status
 *     tags: [Deployment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deployment status
 *       404:
 *         description: Deployment not found
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const deployment = await WebsiteDeployment.findOne({
      _id: id,
      ...(userId && { userId }),
    });

    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Deployment not found',
          statusCode: 404,
        },
      });
    }

    res.json({
      success: true,
      data: deployment,
    });
  } catch (error) {
    logger.error('Error fetching deployment:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch deployment',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/deployment:
 *   get:
 *     summary: Get user's deployments
 *     tags: [Deployment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, deploying, deployed, failed]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of deployments
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, limit = 10, offset = 0 } = req.query;

    const query: any = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const deployments = await WebsiteDeployment
      .find(query)
      .populate('websiteId', 'name description')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await WebsiteDeployment.countDocuments(query);

    res.json({
      success: true,
      data: {
        deployments,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: total > Number(offset) + Number(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching deployments:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch deployments',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/deployment/{id}/redeploy:
 *   post:
 *     summary: Redeploy a website
 *     tags: [Deployment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Redeployment started
 *       404:
 *         description: Deployment not found
 */
router.post('/:id/redeploy', deploymentRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const deployment = await WebsiteDeployment.findOne({
      _id: id,
      ...(userId && { userId }),
    });

    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Deployment not found',
          statusCode: 404,
        },
      });
    }

    // Update deployment status
    deployment.status = 'pending';
    deployment.buildLogs = [];
    deployment.errorMessage = undefined as any;
    await deployment.save();

    // Start redeployment
    deployWebsite((deployment._id as string)).catch((error) => {
      logger.error('Website redeployment failed:', error);
    });

    res.json({
      success: true,
      message: 'Website redeployment started',
      data: {
        deploymentId: deployment._id,
        status: 'deploying',
      },
    });
  } catch (error) {
    logger.error('Error starting redeployment:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to start redeployment',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/deployment/{id}:
 *   delete:
 *     summary: Delete deployment
 *     tags: [Deployment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deployment deleted
 *       404:
 *         description: Deployment not found
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const deployment = await WebsiteDeployment.findOneAndDelete({
      _id: id,
      ...(userId && { userId }),
    });

    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Deployment not found',
          statusCode: 404,
        },
      });
    }

    // Clean up deployment files and DNS records
    try {
      // Remove deployment files from storage
      await cleanupDeploymentFiles(deployment.id);

      // Remove DNS records if applicable
      if (deployment.domain) {
        await cleanupDNSRecords(deployment.domain);
      }

      // Log cleanup completion
      logger.info('Deployment cleanup completed', { deploymentId: deployment.id });

    } catch (cleanupError) {
      logger.error('Error during deployment cleanup:', cleanupError);
      // Don't fail the deletion if cleanup fails, but log it
    }

    res.json({
      success: true,
      message: 'Deployment deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting deployment:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete deployment',
        statusCode: 500,
      },
    });
  }
});

export default router;

// Cleanup utility functions
async function cleanupDeploymentFiles(deploymentId: string): Promise<void> {
  try {
    // Remove deployment files from file system or cloud storage
    const deploymentPath = path.join(process.cwd(), 'deployments', deploymentId);

    if (fs.existsSync(deploymentPath)) {
      fs.rmSync(deploymentPath, { recursive: true, force: true });
      logger.info('Deployment files removed', { deploymentId, path: deploymentPath });
    }

    // In production, this would also clean up cloud storage (S3, etc.)
    // await cloudStorage.deleteFolder(`deployments/${deploymentId}`);

  } catch (error) {
    logger.error('Error cleaning up deployment files:', error);
    throw error;
  }
}

async function cleanupDNSRecords(domain: string): Promise<void> {
  try {
    // Remove DNS records for the domain
    // This would integrate with DNS provider APIs (Cloudflare, Route53, etc.)

    logger.info('DNS records cleanup initiated', { domain });

    // Example integration (would be replaced with actual DNS provider API calls):
    // const dnsProvider = new CloudflareAPI(process.env.CLOUDFLARE_API_KEY);
    // await dnsProvider.deleteRecords(domain);

    // For now, log the cleanup requirement
    logger.warn('DNS cleanup required - integrate with DNS provider', { domain });

  } catch (error) {
    logger.error('Error cleaning up DNS records:', error);
    throw error;
  }
}