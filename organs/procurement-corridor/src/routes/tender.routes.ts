/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import tenderService from '../services/tender.service';
import { AppError } from '../middleware/errorHandler';
import { TenderStatus } from '../types/tender.types';

const router = Router();

// Validation schemas
const createTenderSchema = z.object({
  title: z.string().min(10).max(500),
  description: z.string().min(50),
  type: z.enum(['goods', 'services', 'construction', 'consultancy']),
  estimatedValue: z.number().positive(),
  budgetAvailable: z.number().positive(),
  closingDate: z.string().datetime(),
  minimumRequirements: z.array(z.string()),
  evaluationCriteria: z.array(z.object({
    name: z.string(),
    description: z.string(),
    weight: z.number().min(0).max(100),
    type: z.enum(['price', 'quality', 'bbbee', 'experience', 'custom']),
  })),
  documentRequirements: z.array(z.string()),
  bbbeeRequired: z.boolean().optional(),
  bbbeeMinimumLevel: z.number().min(1).max(8).optional(),
  taxClearanceRequired: z.boolean().optional(),
  centralSupplierDatabaseRequired: z.boolean().optional(),
});

/**
 * POST /api/v1/tenders - Create new tender
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createTenderSchema.parse(req.body);
    
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const tender = await tenderService.createTender(req.user.organizationId, {
      ...validated,
      closingDate: new Date(validated.closingDate),
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: tender,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tenders - List tenders
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const tenders = await tenderService.listTenders(req.user.organizationId, {
      status: req.query.status as TenderStatus | undefined,
      type: req.query.type as string,
    });

    res.json({
      success: true,
      data: tenders,
      count: tenders.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tenders/:id - Get tender details
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tender = await tenderService.getTender(req.params.id);

    if (!tender) {
      throw new AppError('Tender not found', 404);
    }

    res.json({
      success: true,
      data: tender,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tenders/:id/publish - Publish tender
 */
router.post('/:id/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const tender = await tenderService.publishTender(req.params.id, req.user.id);

    res.json({
      success: true,
      data: tender,
      message: 'Tender published and anchored to blockchain',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tenders/:id/close - Close tender
 */
router.post('/:id/close', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tender = await tenderService.closeTender(req.params.id);

    res.json({
      success: true,
      data: tender,
      message: 'Tender closed and corruption analysis initiated',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tenders/:id/bids - Get tender bids
 */
router.get('/:id/bids', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bids = await tenderService.getTenderBids(req.params.id);

    res.json({
      success: true,
      data: bids,
      count: bids.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
