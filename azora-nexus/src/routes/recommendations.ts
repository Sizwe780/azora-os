/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '@/middleware/auth';
import { RecommendationService } from '@/services/RecommendationService';
import { logger } from '@/utils/logger';

const router = Router();
const recommendationService = new RecommendationService();

/**
 * @swagger
 * /api/recommendations/generate:
 *   post:
 *     summary: Generate personalized recommendations
 *     tags: [Recommendations]
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
 *                 enum: [product, content, service, personalized]
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Recommendations generated successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/generate', [
  body('type').isIn(['product', 'content', 'service', 'personalized']).withMessage('Invalid recommendation type'),
  body('context').optional().isObject(),
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

    const { type, context } = req.body;
    const userId = req.user!.id;

    const recommendation = await recommendationService.generateRecommendations(
      userId,
      type,
      context
    );

    res.json({
      success: true,
      data: recommendation,
    });
  } catch (error: any) {
    logger.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate recommendations',
        code: 'RECOMMENDATION_GENERATION_FAILED',
      },
    });
  }
});

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get user recommendations
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [product, content, service, personalized]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', [
  query('type').optional().isIn(['product', 'content', 'service', 'personalized']),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
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

    const { type, limit = 20 } = req.query;
    const userId = req.user!.id;

    const recommendations = await recommendationService.getUserRecommendations(
      userId,
      type as string,
      limit as number
    );

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
    });
  } catch (error: any) {
    logger.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch recommendations',
        code: 'RECOMMENDATION_FETCH_FAILED',
      },
    });
  }
});

/**
 * @swagger
 * /api/recommendations/{id}/feedback:
 *   post:
 *     summary: Submit feedback for a recommendation
 *     tags: [Recommendations]
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Recommendation not found
 *       500:
 *         description: Server error
 */
router.post('/:id/feedback', [
  param('id').isMongoId().withMessage('Invalid recommendation ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comments').optional().isString().isLength({ max: 500 }),
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
    const { rating, comments } = req.body;

    await recommendationService.updateRecommendationFeedback(id, {
      rating,
      comments,
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error: any) {
    logger.error('Error submitting recommendation feedback:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to submit feedback',
        code: 'FEEDBACK_SUBMISSION_FAILED',
      },
    });
  }
});

export default router;