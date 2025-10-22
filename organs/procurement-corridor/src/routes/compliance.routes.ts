/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response, NextFunction } from 'express';
import complianceService from '../services/compliance.service';
import tenderService from '../services/tender.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/v1/compliance/rules - Get all compliance rules
 */
router.get('/rules', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = complianceService.getComplianceRules();

    res.json({
      success: true,
      data: rules,
      count: rules.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/compliance/tender/:id - Run compliance check on tender
 */
router.post('/tender/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tender = await tenderService.getTender(req.params.id);

    if (!tender) {
      throw new AppError('Tender not found', 404);
    }

    const compliance = await complianceService.checkTenderCompliance(tender);

    res.json({
      success: true,
      data: compliance,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/compliance/bid/:id - Run compliance check on bid
 */
router.post('/bid/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bid = await tenderService.getBid(req.params.id);

    if (!bid) {
      throw new AppError('Bid not found', 404);
    }

    const tender = await tenderService.getTender(bid.tenderId);

    if (!tender) {
      throw new AppError('Tender not found', 404);
    }

    const compliance = await complianceService.checkBidCompliance(tender, bid);

    res.json({
      success: true,
      data: compliance,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
