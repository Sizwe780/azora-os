/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '@/middleware/auth';
import { NeuralIntentService } from '@/services/NeuralIntentService';
import { logger } from '@/utils/logger';

const router = Router();
const neuralIntentService = new NeuralIntentService();

/**
 * @swagger
 * /api/neural/process:
 *   post:
 *     summary: Process user input and extract neural intent
 *     tags: [Neural]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - input
 *             properties:
 *               input:
 *                 type: string
 *                 description: User input text to analyze
 *               context:
 *                 type: object
 *                 description: Additional context for intent analysis
 *     responses:
 *       200:
 *         description: Neural intent processed successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/process', [
  body('input').isString().isLength({ min: 1, max: 1000 }).withMessage('Input must be 1-1000 characters'),
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

    const { input, context } = req.body;
    const userId = req.user!.id;

    const neuralIntent = await neuralIntentService.processUserInput(
      userId,
      input,
      context
    );

    res.json({
      success: true,
      data: neuralIntent,
    });
  } catch (error: any) {
    logger.error('Error processing neural intent:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to process neural intent',
        code: 'NEURAL_PROCESSING_FAILED',
      },
    });
  }
});

/**
 * @swagger
 * /api/neural/intents:
 *   get:
 *     summary: Get user neural intents
 *     tags: [Neural]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *     responses:
 *       200:
 *         description: Neural intents retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/intents', [
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

    const { limit = 50 } = req.query;
    const userId = req.user!.id;

    const intents = await neuralIntentService.getUserIntents(
      userId,
      limit as number
    );

    res.json({
      success: true,
      data: intents,
      count: intents.length,
    });
  } catch (error: any) {
    logger.error('Error fetching neural intents:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch neural intents',
        code: 'INTENT_FETCH_FAILED',
      },
    });
  }
});

/**
 * @swagger
 * /api/neural/intents/{id}/feedback:
 *   post:
 *     summary: Submit feedback for a neural intent
 *     tags: [Neural]
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
 *         description: Neural intent not found
 *       500:
 *         description: Server error
 */
router.post('/intents/:id/feedback', [
  param('id').isMongoId().withMessage('Invalid intent ID'),
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

    await neuralIntentService.updateIntentFeedback(id, {
      rating,
      comments,
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error: any) {
    logger.error('Error submitting intent feedback:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to submit feedback',
        code: 'FEEDBACK_SUBMISSION_FAILED',
      },
    });
  }
});

/**
 * @swagger
 * /api/neural/insights/{intentId}:
 *   get:
 *     summary: Get insights derived from a specific neural intent
 *     tags: [Neural]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: intentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Insights retrieved successfully
 *       400:
 *         description: Invalid intent ID
 *       404:
 *         description: Neural intent not found
 *       500:
 *         description: Server error
 */
router.get('/insights/:intentId', [
  param('intentId').isMongoId().withMessage('Invalid intent ID'),
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

    const { intentId } = req.params;

    // Get the specific intent
    const intent = await neuralIntentService.getUserIntents(req.user!.id, 1)
      .then(intents => intents.find(i => i._id.toString() === intentId));

    if (!intent) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Neural intent not found',
          code: 'INTENT_NOT_FOUND',
        },
      });
    }

    res.json({
      success: true,
      data: {
        intent,
        insights: intent.processingResult?.insights || [],
        recommendations: intent.processingResult?.recommendations || [],
        actions: intent.processingResult?.actions || [],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching intent insights:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch intent insights',
        code: 'INSIGHT_FETCH_FAILED',
      },
    });
  }
});

export default router;