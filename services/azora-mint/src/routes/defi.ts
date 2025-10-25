/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { body, validationResult } from 'express-validator';
import { DefiService } from '../services/DefiService';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const defiService = new DefiService();

/**
 * @swagger
 * /api/v1/defi/pools:
 *   get:
 *     summary: Get available DeFi pools
 *     tags: [DeFi]
 *     responses:
 *       200:
 *         description: List of DeFi pools
 */
router.get('/pools', async (req, res) => {
  try {
    const pools = await defiService.getAvailablePools();
    res.json({ pools });
  } catch (error) {
    console.error('Get pools error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/defi/deposit:
 *   post:
 *     summary: Deposit tokens into a DeFi pool
 *     tags: [DeFi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - poolId
 *               - amount
 *             properties:
 *               poolId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *     responses:
 *       201:
 *         description: Deposit successful
 */
router.post('/deposit', [
  body('poolId').isString().withMessage('Pool ID must be a string'),
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { poolId, amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const deposit = await defiService.depositToPool(userId, poolId, amount);

    res.status(201).json({
      message: 'Deposit successful',
      deposit
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/defi/withdraw:
 *   post:
 *     summary: Withdraw tokens from a DeFi pool
 *     tags: [DeFi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - poolId
 *               - amount
 *             properties:
 *               poolId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *     responses:
 *       200:
 *         description: Withdrawal successful
 */
router.post('/withdraw', [
  body('poolId').isString().withMessage('Pool ID must be a string'),
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { poolId, amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const withdrawal = await defiService.withdrawFromPool(userId, poolId, amount);

    res.json({
      message: 'Withdrawal successful',
      withdrawal
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/defi/positions:
 *   get:
 *     summary: Get user's DeFi positions
 *     tags: [DeFi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of DeFi positions
 */
router.get('/positions', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const positions = await defiService.getUserPositions(userId);

    res.json({ positions });
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/defi/yield:
 *   get:
 *     summary: Get user's yield farming rewards
 *     tags: [DeFi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Yield farming rewards
 */
router.get('/yield', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const rewards = await defiService.getYieldRewards(userId);

    res.json({ rewards });
  } catch (error) {
    console.error('Get yield error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;