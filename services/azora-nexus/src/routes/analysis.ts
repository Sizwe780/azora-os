/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '@/middleware/auth';
import { AnalysisService } from '@/services/AnalysisService';
import { logger } from '@/utils/logger';

const router = Router();
const analysisService = new AnalysisService();

/**
 * @swagger
 * /api/analysis/perform:
 *   post:
 *     summary: Perform user behavior analysis
 *     tags: [Analysis]
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
 *                 enum: [behavioral, predictive, comparative, trend]
 *               parameters:
 *                 type: object
 *                 properties:
 *                   timeRange:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date-time
 *                       end:
 *                         type: string
 *                         format: date-time
 *                   filters:
 *                     type: object
 *     responses:
 *       200:
 *         description: Analysis initiated successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/perform', [
  body('type').isIn(['behavioral', 'predictive', 'comparative', 'trend']).withMessage('Invalid analysis type'),
  body('parameters').optional().isObject(),
  body('parameters.timeRange').optional().isObject(),
  body('parameters.timeRange.start').optional().isISO8601(),
  body('parameters.timeRange.end').optional().isISO8601(),
  body('parameters.filters').optional().isObject(),
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

    const { type, parameters = {} } = req.body;
    const userId = req.user!.id;

    // Convert time range strings to Date objects
    if (parameters.timeRange) {
      if (parameters.timeRange.start) {
        parameters.timeRange.start = new Date(parameters.timeRange.start);
      }
      if (parameters.timeRange.end) {
        parameters.timeRange.end = new Date(parameters.timeRange.end);
      }
    }

    const analysis = await analysisService.performAnalysis(
      userId,
      type as 'behavioral' | 'predictive' | 'comparative' | 'trend',
      parameters
    );

    res.json({
      success: true,
      data: analysis,
      message: 'Analysis initiated successfully. Results will be available shortly.',
    });
  } catch (error: any) {
    logger.error('Error performing analysis:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to perform analysis',
        code: 'ANALYSIS_FAILED',
      },
    });
  }
});

/**
 * @swagger
 * /api/analysis:
 *   get:
 *     summary: Get user analyses
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [behavioral, predictive, comparative, trend]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [processing, completed, failed]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *     responses:
 *       200:
 *         description: Analyses retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', [
  query('type').optional().isIn(['behavioral', 'predictive', 'comparative', 'trend']),
  query('status').optional().isIn(['processing', 'completed', 'failed']),
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

    const { type, status, limit = 20 } = req.query;
    const userId = req.user!.id;

    const analyses = await analysisService.getUserAnalyses(
      userId,
      type as string,
      status as string,
      limit as number
    );

    res.json({
      success: true,
      data: analyses,
      count: analyses.length,
    });
  } catch (error: any) {
    logger.error('Error fetching analyses:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch analyses',
        code: 'ANALYSIS_FETCH_FAILED',
      },
    });
  }
});

/**
 * @swagger
 * /api/analysis/{id}:
 *   get:
 *     summary: Get analysis by ID
 *     tags: [Analysis]
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
 *         description: Analysis retrieved successfully
 *       400:
 *         description: Invalid analysis ID
 *       404:
 *         description: Analysis not found
 *       500:
 *         description: Server error
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid analysis ID'),
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

    const analysis = await analysisService.getAnalysisById(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Analysis not found',
          code: 'ANALYSIS_NOT_FOUND',
        },
      });
    }

    // Check if the analysis belongs to the authenticated user
    if (analysis.userId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'ACCESS_DENIED',
        },
      });
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    logger.error('Error fetching analysis:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch analysis',
        code: 'ANALYSIS_FETCH_FAILED',
      },
    });
  }
});

/**
 * @swagger
 * /api/analysis/types:
 *   get:
 *     summary: Get available analysis types
 *     tags: [Analysis]
 *     responses:
 *       200:
 *         description: Analysis types retrieved successfully
 */
router.get('/types', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'behavioral',
        name: 'Behavioral Analysis',
        description: 'Analyze user behavior patterns and preferences',
        estimatedDuration: '30 seconds',
      },
      {
        id: 'predictive',
        name: 'Predictive Analysis',
        description: 'Forecast future user interests and actions',
        estimatedDuration: '45 seconds',
      },
      {
        id: 'comparative',
        name: 'Comparative Analysis',
        description: 'Compare user behavior against general patterns',
        estimatedDuration: '20 seconds',
      },
      {
        id: 'trend',
        name: 'Trend Analysis',
        description: 'Analyze user behavior changes over time',
        estimatedDuration: '35 seconds',
      },
    ],
  });
});

/**
 * @swagger
 * /api/analysis/stats:
 *   get:
 *     summary: Get analysis statistics for the user
 *     tags: [Analysis]
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

    // Get analysis counts by type and status
    const analyses = await analysisService.getUserAnalyses(userId, undefined, undefined, 1000);

    const stats = {
      total: analyses.length,
      byStatus: {
        processing: analyses.filter(a => a.status === 'processing').length,
        completed: analyses.filter(a => a.status === 'completed').length,
        failed: analyses.filter(a => a.status === 'failed').length,
      },
      byType: {
        behavioral: analyses.filter(a => a.type === 'behavioral').length,
        predictive: analyses.filter(a => a.type === 'predictive').length,
        comparative: analyses.filter(a => a.type === 'comparative').length,
        trend: analyses.filter(a => a.type === 'trend').length,
      },
      averageProcessingTime: analyses
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.metadata.processingTime || 0), 0) /
        Math.max(analyses.filter(a => a.status === 'completed').length, 1),
      successRate: analyses.length > 0 ?
        (analyses.filter(a => a.status === 'completed').length / analyses.length) * 100 : 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error fetching analysis stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch analysis statistics',
        code: 'STATS_FETCH_FAILED',
      },
    });
  }
});

export default router;