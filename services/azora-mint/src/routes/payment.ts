/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { body, validationResult } from 'express-validator';
import { PaymentService } from '../services/PaymentService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();
const paymentService = new PaymentService();

/**
 * @swagger
 * /api/v1/payment/send:
 *   post:
 *     summary: Send payment to another user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - amount
 *             properties:
 *               recipientId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment sent successfully
 */
router.post('/send', [
  body('recipientId').isString().withMessage('Recipient ID must be a string'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, amount, description } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (senderId === recipientId) {
      return res.status(400).json({ error: 'Cannot send payment to yourself' });
    }

    const payment = await paymentService.sendPayment(senderId, recipientId, amount, description);

    res.status(201).json({
      message: 'Payment sent successfully',
      payment
    });
  } catch (error) {
    console.error('Send payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/payment/request:
 *   post:
 *     summary: Request payment from another user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - amount
 *               - description
 *             properties:
 *               recipientId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment request created
 */
router.post('/request', [
  body('recipientId').isString().withMessage('Recipient ID must be a string'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('description').isString().withMessage('Description is required')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, amount, description } = req.body;
    const requesterId = req.user?.id;

    if (!requesterId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const request = await paymentService.requestPayment(requesterId, recipientId, amount, description);

    res.status(201).json({
      message: 'Payment request created',
      request
    });
  } catch (error) {
    console.error('Request payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/payment/transactions:
 *   get:
 *     summary: Get user's payment transactions
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 20
 *     responses:
 *       200:
 *         description: List of payment transactions
 */
router.get('/transactions', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const transactions = await paymentService.getUserTransactions(userId, limit);

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/payment/requests:
 *   get:
 *     summary: Get payment requests for user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payment requests
 */
router.get('/requests', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const requests = await paymentService.getPaymentRequests(userId);

    res.json({ requests });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/payment/fulfill/{requestId}:
 *   post:
 *     summary: Fulfill a payment request
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment request fulfilled
 */
router.post('/fulfill/:requestId', async (req: AuthenticatedRequest, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await paymentService.fulfillPaymentRequest(userId, requestId);

    res.json({
      message: 'Payment request fulfilled',
      result
    });
  } catch (error) {
    console.error('Fulfill request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;