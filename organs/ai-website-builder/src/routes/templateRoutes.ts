/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import { WebsiteTemplate } from '../models/Website';
import { customMetrics } from '../middleware/metrics';
import logger from '../utils/logger';

const router = Router();

// Note: AuthenticatedRequest is defined globally via Express namespace extension
type AuthenticatedRequest = Request;

/**
 * @swagger
 * /api/v1/templates:
 *   get:
 *     summary: Get all available templates
 *     tags: [Templates]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [minimal, modern, creative, corporate, ecommerce]
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *           enum: [ecommerce, blog, portfolio, business, restaurant, agency, other]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of templates
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, businessType, limit = 20 } = req.query;

    const query: any = { isActive: true };
    if (category) query.category = category;
    if (businessType) query.businessType = { $in: [businessType] };

    const templates = await WebsiteTemplate
      .find(query)
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch templates',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template details
 *       404:
 *         description: Template not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const template = await WebsiteTemplate.findById(id);

    if (!template || !template.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Template not found',
          statusCode: 404,
        },
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    logger.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch template',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/templates/categories:
 *   get:
 *     summary: Get template categories
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories/list', async (req: Request, res: Response) => {
  try {
    const categories = await WebsiteTemplate.distinct('category', { isActive: true });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch categories',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/templates/business-types:
 *   get:
 *     summary: Get business types
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: List of business types
 */
router.get('/business-types/list', async (req: Request, res: Response) => {
  try {
    const businessTypes = await WebsiteTemplate.distinct('businessType', { isActive: true });

    res.json({
      success: true,
      data: businessTypes,
    });
  } catch (error) {
    logger.error('Error fetching business types:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch business types',
        statusCode: 500,
      },
    });
  }
});

/**
 * @swagger
 * /api/v1/templates/{id}/use:
 *   post:
 *     summary: Increment template usage count
 *     tags: [Templates]
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
 *         description: Template usage updated
 */
router.post('/:id/use', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const template = await WebsiteTemplate.findByIdAndUpdate(
      id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Template not found',
          statusCode: 404,
        },
      });
    }

    customMetrics.templatesUsedTotal.labels(template.category).inc();

    res.json({
      success: true,
      message: 'Template usage recorded',
    });
  } catch (error) {
    logger.error('Error recording template usage:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to record template usage',
        statusCode: 500,
      },
    });
  }
});

export default router;