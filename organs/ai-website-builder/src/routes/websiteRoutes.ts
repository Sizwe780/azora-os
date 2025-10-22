/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import { WebsiteGeneration } from '../models/Website';
import { customMetrics } from '../middleware/metrics';
import { generationRateLimiter } from '../middleware/rateLimiter';
import logger from '../utils/logger';
import { generateWebsiteContent } from '../services/aiService';

const router = Router();

// Note: AuthenticatedRequest is defined globally via Express namespace extension
type AuthenticatedRequest = Request;

/**
 * @swagger
 * /api/v1/websites/generate:
 *   post:
 *     summary: Generate a new website using AI
 *     tags: [Websites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - businessType
 *               - targetAudience
 *             properties:
 *               name:
 *                 type: string
 *                 description: Website name
 *               description:
 *                 type: string
 *                 description: Website description
 *               businessType:
 *                 type: string
 *                 enum: [ecommerce, blog, portfolio, business, restaurant, agency, other]
 *               targetAudience:
 *                 type: string
 *                 description: Target audience description
 *               colorScheme:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Color scheme (hex colors)
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Website features
 *               templateId:
 *                 type: string
 *                 description: Template ID to use
 *     responses:
 *       201:
 *         description: Website generation started
 *       400:
 *         description: Invalid request data
 */
router.post('/generate', generationRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      description,
      businessType,
      targetAudience,
      colorScheme = ['#007bff', '#28a745', '#dc3545'],
      features = [],
      templateId,
    } = req.body;

    const userId = req.user?.id || 'anonymous';

    // Create AI prompt
    const aiPrompt = `Generate a ${businessType} website for ${targetAudience}.
    Website name: ${name}
    Description: ${description}
    Features: ${features.join(', ')}
    Color scheme: ${colorScheme.join(', ')}`;

    // Create website generation record
    const website = new WebsiteGeneration({
      userId,
      name,
      description,
      businessType,
      targetAudience,
      colorScheme,
      features,
      templateId,
      aiPrompt,
      status: 'pending',
    });

    await website.save();

    // Start async generation
    generateWebsiteContent((website._id as string)).catch((error) => {
      logger.error('Website generation failed:', error);
    });

    customMetrics.aiRequestsTotal.labels('website_generation').inc();

    res.status(201).json({
      success: true,
      data: {
        websiteId: website._id,
        status: 'generating',
        message: 'Website generation started',
      },
    });
  } catch (error) {
    logger.error('Error starting website generation:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to start website generation',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/websites/{id}:
 *   get:
 *     summary: Get website by ID
 *     tags: [Websites]
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
 *         description: Website details
 *       404:
 *         description: Website not found
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const website = await WebsiteGeneration.findOne({
      _id: id,
      ...(userId && { userId }),
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Website not found',
          statusCode: 404,
        },
      });
    }

    res.json({
      success: true,
      data: website,
    });
  } catch (error) {
    logger.error('Error fetching website:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch website',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/websites:
 *   get:
 *     summary: Get user's websites
 *     tags: [Websites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, generating, completed, failed]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of websites
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, limit = 10, offset = 0 } = req.query;

    const query: any = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const websites = await WebsiteGeneration
      .find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await WebsiteGeneration.countDocuments(query);

    res.json({
      success: true,
      data: {
        websites,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: total > Number(offset) + Number(limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching websites:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch websites',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/websites/{id}:
 *   put:
 *     summary: Update website customizations
 *     tags: [Websites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customizations:
 *                 type: object
 *     responses:
 *       200:
 *         description: Website updated
 *       404:
 *         description: Website not found
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { customizations } = req.body;
    const userId = req.user?.id;

    const website = await WebsiteGeneration.findOneAndUpdate(
      {
        _id: id,
        ...(userId && { userId }),
      },
      {
        customizations,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!website) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Website not found',
          statusCode: 404,
        },
      });
    }

    res.json({
      success: true,
      data: website,
    });
  } catch (error) {
    logger.error('Error updating website:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update website',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/websites/{id}:
 *   delete:
 *     summary: Delete website
 *     tags: [Websites]
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
 *         description: Website deleted
 *       404:
 *         description: Website not found
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const website = await WebsiteGeneration.findOneAndDelete({
      _id: id,
      ...(userId && { userId }),
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Website not found',
          statusCode: 404,
        },
      });
    }

    res.json({
      success: true,
      message: 'Website deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting website:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete website',
        statusCode: 500,
      },
    });
  }
});

export default router;