/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response, NextFunction } from 'express';
import corruptionService from '../services/corruption.service';
import tenderService from '../services/tender.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/v1/corruption/analyze/:tenderId - Analyze tender for corruption
 */
router.post('/analyze/:tenderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tender = await tenderService.getTender(req.params.tenderId);

    if (!tender) {
      throw new AppError('Tender not found', 404);
    }

    const bids = await tenderService.getTenderBids(req.params.tenderId);

    const analysis = await corruptionService.analyzeTender(tender, bids);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
