/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { body, validationResult } from 'express-validator';
import { LiquidityService } from '../services/LiquidityService';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();
const liquidityService = new LiquidityService();

/**
 * @swagger
 * /api/v1/liquidity/pools:
 *   get:
 *     summary: Get available liquidity pools
 *     tags: [Liquidity]
 *     responses:
 *       200:
 *         description: List of liquidity pools
 */
router.get('/pools', async (req, res) => {
  try {
    const pools = await liquidityService.getLiquidityPools();
    res.json({ pools });
  } catch (error) {
    console.error('Get pools error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/liquidity/add:
 *   post:
 *     summary: Add liquidity to a pool
 *     tags: [Liquidity]
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
 *               - tokenA
 *               - tokenB
 *               - amountA
 *               - amountB
 *             properties:
 *               poolId:
 *                 type: string
 *               tokenA:
 *                 type: string
 *               tokenB:
 *                 type: string
 *               amountA:
 *                 type: number
 *                 minimum: 0.01
 *               amountB:
 *                 type: number
 *                 minimum: 0.01
 *     responses:
 *       201:
 *         description: Liquidity added successfully
 */
router.post('/add', [
  body('poolId').isString().withMessage('Pool ID must be a string'),
  body('tokenA').isString().withMessage('Token A must be a string'),
  body('tokenB').isString().withMessage('Token B must be a string'),
  body('amountA').isNumeric().withMessage('Amount A must be a number'),
  body('amountB').isNumeric().withMessage('Amount B must be a number')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { poolId, tokenA, tokenB, amountA, amountB } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await liquidityService.addLiquidity(userId, poolId, tokenA, tokenB, amountA, amountB);

    res.status(201).json({
      message: 'Liquidity added successfully',
      result
    });
  } catch (error) {
    console.error('Add liquidity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/liquidity/remove:
 *   post:
 *     summary: Remove liquidity from a pool
 *     tags: [Liquidity]
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
 *               - liquidityTokens
 *             properties:
 *               poolId:
 *                 type: string
 *               liquidityTokens:
 *                 type: number
 *                 minimum: 0.01
 *     responses:
 *       200:
 *         description: Liquidity removed successfully
 */
router.post('/remove', [
  body('poolId').isString().withMessage('Pool ID must be a string'),
  body('liquidityTokens').isNumeric().withMessage('Liquidity tokens must be a number')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { poolId, liquidityTokens } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await liquidityService.removeLiquidity(userId, poolId, liquidityTokens);

    res.json({
      message: 'Liquidity removed successfully',
      result
    });
  } catch (error) {
    console.error('Remove liquidity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/liquidity/positions:
 *   get:
 *     summary: Get user's liquidity positions
 *     tags: [Liquidity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of liquidity positions
 */
router.get('/positions', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const positions = await liquidityService.getUserLiquidityPositions(userId);

    res.json({ positions });
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/liquidity/swap:
 *   post:
 *     summary: Swap tokens through liquidity pools
 *     tags: [Liquidity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromToken
 *               - toToken
 *               - amount
 *             properties:
 *               fromToken:
 *                 type: string
 *               toToken:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *     responses:
 *       200:
 *         description: Token swap executed
 */
router.post('/swap', [
  body('fromToken').isString().withMessage('From token must be a string'),
  body('toToken').isString().withMessage('To token must be a string'),
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fromToken, toToken, amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await liquidityService.swapTokens(userId, fromToken, toToken, amount);

    res.json({
      message: 'Token swap executed successfully',
      result
    });
  } catch (error) {
    console.error('Swap error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;