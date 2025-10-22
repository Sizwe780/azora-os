/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { body, validationResult } from 'express-validator';
import { StakingService } from '../services/StakingService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();
const stakingService = new StakingService();

/**
 * @swagger
 * /api/v1/staking/stake:
 *   post:
 *     summary: Stake AZR tokens
 *     tags: [Staking]
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
 *               - duration
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               duration:
 *                 type: number
 *                 minimum: 30
 *                 maximum: 365
 *                 description: Duration in days
 *     responses:
 *       201:
 *         description: Staking position created
 */
router.post('/stake', [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('duration').isNumeric().withMessage('Duration must be a number')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, duration } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stake = await stakingService.createStake(userId, amount, duration);

    res.status(201).json({
      message: 'Staking position created successfully',
      stake
    });
  } catch (error) {
    console.error('Staking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/staking/positions:
 *   get:
 *     summary: Get user's staking positions
 *     tags: [Staking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staking positions
 */
router.get('/positions', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const positions = await stakingService.getUserStakingPositions(userId);

    res.json({ positions });
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/staking/unstake/{stakeId}:
 *   post:
 *     summary: Unstake tokens
 *     tags: [Staking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stakeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unstaking initiated
 */
router.post('/unstake/:stakeId', async (req: AuthenticatedRequest, res) => {
  try {
    const { stakeId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await stakingService.unstake(userId, stakeId);

    res.json({
      message: 'Unstaking initiated successfully',
      result
    });
  } catch (error) {
    console.error('Unstaking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/staking/rewards:
 *   get:
 *     summary: Get staking rewards
 *     tags: [Staking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staking rewards information
 */
router.get('/rewards', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const rewards = await stakingService.getStakingRewards(userId);

    res.json({ rewards });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/staking/stats:
 *   get:
 *     summary: Get staking statistics
 *     tags: [Staking]
 *     responses:
 *       200:
 *         description: Global staking statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await stakingService.getStakingStats();

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;