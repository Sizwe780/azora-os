/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response, NextFunction } from 'express';
import blockchainService from '../services/blockchain.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/v1/blockchain/verify/:hash - Verify blockchain anchor
 */
router.get('/verify/:hash', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const verified = await blockchainService.verifyAnchor(req.params.hash);

    res.json({
      success: true,
      verified,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/blockchain/audit/:tenderId - Get full audit trail
 */
router.get('/audit/:tenderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trail = await blockchainService.getAuditTrail(req.params.tenderId);

    res.json({
      success: true,
      data: trail,
      count: trail.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
