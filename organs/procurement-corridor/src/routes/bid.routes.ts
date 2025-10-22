/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import tenderService from '../services/tender.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schema
const submitBidSchema = z.object({
  tenderId: z.string(),
  bidAmount: z.number().positive(),
  currency: z.string().default('ZAR'),
  documents: z.array(z.object({
    name: z.string(),
    type: z.string(),
    url: z.string().url(),
  })),
  taxClearanceCertificate: z.string().optional(),
  bbbeeLevel: z.number().min(1).max(8).optional(),
  bbbeeCertificate: z.string().optional(),
  csdRegistrationNumber: z.string().optional(),
});

/**
 * POST /api/v1/bids - Submit bid
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = submitBidSchema.parse(req.body);
    
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const bid = await tenderService.submitBid(
      validated.tenderId,
      req.user.organizationId,
      req.user.id, // supplierId
      validated
    );

    res.status(201).json({
      success: true,
      data: bid,
      message: 'Bid submitted and anchored to blockchain',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/bids/tender/:tenderId - Get bids for tender
 */
router.get('/tender/:tenderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bids = await tenderService.getTenderBids(req.params.tenderId);

    res.json({
      success: true,
      data: bids,
      count: bids.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/bids/:id/award - Award bid
 */
router.post('/:id/award', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { tenderId, awardNotes } = req.body;

    if (!tenderId) {
      throw new AppError('Tender ID required', 400);
    }

    const bid = await tenderService.awardTender(
      tenderId,
      req.params.id,
      req.user.id,
      awardNotes
    );

    res.json({
      success: true,
      data: bid,
      message: 'Bid awarded and anchored to blockchain',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
