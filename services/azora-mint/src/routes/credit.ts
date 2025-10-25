/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { body, validationResult } from 'express-validator';
import { CreditService } from '../services/CreditService';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const creditService = new CreditService();

/**
 * @swagger
 * /api/v1/credit/apply:
 *   post:
 *     summary: Apply for credit
 *     tags: [Credit]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - purpose
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               purpose:
 *                 type: string
 *                 enum: [business, personal, education, emergency]
 *     responses:
 *       201:
 *         description: Credit application submitted
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/apply', [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('purpose').isIn(['business', 'personal', 'education', 'emergency']).withMessage('Invalid purpose')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, purpose } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const application = await creditService.applyForCredit(userId, amount, purpose);

    res.status(201).json({
      message: 'Credit application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Credit application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/credit/applications:
 *   get:
 *     summary: Get user's credit applications
 *     tags: [Credit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of credit applications
 */
router.get('/applications', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const applications = await creditService.getUserApplications(userId);

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/credit/loans:
 *   get:
 *     summary: Get user's active loans
 *     tags: [Credit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active loans
 */
router.get('/loans', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const loans = await creditService.getUserLoans(userId);

    res.json({ loans });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/credit/repay/{loanId}:
 *   post:
 *     summary: Make a loan repayment
 *     tags: [Credit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
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
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *     responses:
 *       200:
 *         description: Repayment processed
 */
router.post('/repay/:loanId', [
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { loanId } = req.params;
    const { amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const repayment = await creditService.makeRepayment(userId, loanId, amount);

    res.json({
      message: 'Repayment processed successfully',
      repayment
    });
  } catch (error) {
    console.error('Repayment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/credit/trust-score:
 *   get:
 *     summary: Get user's trust score
 *     tags: [Credit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's trust score
 */
router.get('/trust-score', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const trustScore = await creditService.getTrustScore(userId);

    res.json({ trustScore });
  } catch (error) {
    console.error('Get trust score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;