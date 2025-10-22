/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '@/middleware/auth';
import { InsightService } from '@/services/InsightService';
import { logger } from '@/utils/logger';

const router = Router();
const insightService = new InsightService();

/**
 * @swagger
 * /api/insights/generate:
 *   post:
 *     summary: Generate insights for a user
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [behavioral, predictive, comparative, trend, anomaly]
 *     responses:
 *       200:
 *         description: Insights generated successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/generate', [
  body('type').isIn(['behavioral', 'predictive', 'comparative', 'trend', 'anomaly']).withMessage('Invalid insight type'),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array(),
        },
      });
    }

    const { type } = req.body;
    const userId = req.user!.id;

    const insights = await insightService.generateInsights(
      userId,
      type as 'behavioral' | 'predictive' | 'comparative' | 'trend' | 'anomaly'
    );

    res.json({
      success: true,
      data: insights,
      count: insights.length,
    });
  } catch (error: any) {
    logger.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate insights',
        code: 'INSIGHT_GENERATION_FAILED',
      },
    });
  }
});

/**
 * @swagger
 * /api/insights:
 *   get:
 *     summary: Get user insights
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [behavioral, predictive, comparative, trend, anomaly]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, viewed, acted_upon, dismissed]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *     responses:
 *       200:
 *         description: Insights retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', [
  query('category').optional().isIn(['behavioral', 'predictive', 'comparative', 'trend', 'anomaly']),
  query('status').optional().isIn(['new', 'viewed', 'acted_upon', 'dismissed']),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array(),
        },
      });
    }

    const { category, status, limit = 20 } = req.query;
    const userId = req.user!.id;

    const insights = await insightService.getUserInsights(
      userId,
      category as string,
      status as string,
      limit as number
    );

    res.json({
      success: true,
      data: insights,
      count: insights.length,
    });
  } catch (error: any) {
    logger.error('Error fetching insights:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch insights',
        code: 'INSIGHT_FETCH_FAILED',
      },
    });
  }
});

/**
 * @swagger
 * /api/insights/{id}/status:
 *   put:
 *     summary: Update insight status
 *     tags: [Insights]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, viewed, acted_upon, dismissed]
 *     responses:
 *       200:
 *         description: Insight status updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Insight not found
 *       500:
 *         description: Server error
 */
router.put('/:id/status', [
  param('id').isMongoId().withMessage('Invalid insight ID'),
  body('status').isIn(['new', 'viewed', 'acted_upon', 'dismissed']).withMessage('Invalid status'),
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array(),
        },
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    await insightService.updateInsightStatus(
      id,
      status as 'new' | 'viewed' | 'acted_upon' | 'dismissed'
    );

    res.json({
      success: true,
      message: 'Insight status updated successfully',
    });
  } catch (error: any) {
    logger.error('Error updating insight status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update insight status',
        code: 'STATUS_UPDATE_FAILED',
      },
    });
  }
});

/**
 * @swagger
 * /api/insights/categories:
 *   get:
 *     summary: Get available insight categories
 *     tags: [Insights]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'behavioral',
        name: 'Behavioral Insights',
        description: 'Analysis of user behavior patterns and preferences',
      },
      {
        id: 'predictive',
        name: 'Predictive Insights',
        description: 'Forecasting future user interests and actions',
      },
      {
        id: 'comparative',
        name: 'Comparative Insights',
        description: 'Benchmarking against general user patterns',
      },
      {
        id: 'trend',
        name: 'Trend Insights',
        description: 'Analysis of user behavior changes over time',
      },
      {
        id: 'anomaly',
        name: 'Anomaly Insights',
        description: 'Detection of unusual user behavior patterns',
      },
    ],
  });
});

/**
 * @swagger
 * /api/insights/stats:
 *   get:
 *     summary: Get insight statistics for the user
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/stats', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get insight counts by status and category
    const insights = await insightService.getUserInsights(userId, undefined, undefined, 1000);

    const stats = {
      total: insights.length,
      byStatus: {
        new: insights.filter(i => i.status === 'new').length,
        viewed: insights.filter(i => i.status === 'viewed').length,
        acted_upon: insights.filter(i => i.status === 'acted_upon').length,
        dismissed: insights.filter(i => i.status === 'dismissed').length,
      },
      byCategory: {
        behavioral: insights.filter(i => i.category === 'behavioral').length,
        predictive: insights.filter(i => i.category === 'predictive').length,
        comparative: insights.filter(i => i.category === 'comparative').length,
        trend: insights.filter(i => i.category === 'trend').length,
        anomaly: insights.filter(i => i.category === 'anomaly').length,
      },
      actionable: insights.filter(i => i.actionable).length,
      highPriority: insights.filter(i => i.priority === 'high' || i.priority === 'critical').length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error fetching insight stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch insight statistics',
        code: 'STATS_FETCH_FAILED',
      },
    });
  }
});

export default router;