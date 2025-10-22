/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { PRICING_TIERS, calculatePromoPrice, getSubscriptionPhase } from '../../../src/types/subscription';

const router = Router();

// Validation schema
const createSubscriptionSchema = z.object({
  tierId: z.string(),
  interval: z.enum(['monthly', 'annual']),
  organizationId: z.string(),
});

/**
 * GET /api/v1/subscriptions/tiers - Get pricing tiers
 */
router.get('/tiers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: PRICING_TIERS,
      promotion: {
        trialDays: 14,
        promoMonths: 3,
        promoDiscount: 0.75,
        description: '2 weeks free trial, then 75% off for 3 months',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/subscriptions - Create subscription
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createSubscriptionSchema.parse(req.body);

    const tier = PRICING_TIERS.find(t => t.id === validated.tierId);

    if (!tier) {
      throw new AppError('Invalid pricing tier', 400);
    }

    // Calculate trial and promo dates
    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + tier.trialDays);

    const promoEndDate = new Date(trialEndDate);
    promoEndDate.setMonth(promoEndDate.getMonth() + tier.promoMonths);

    const subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      organizationId: validated.organizationId,
      tier: tier.tier,
      pricingTierId: tier.id,
      status: 'trial',
      interval: validated.interval,
      createdAt: now,
      trialStartDate: now,
      trialEndDate,
      promoStartDate: trialEndDate,
      promoEndDate,
      currentPeriodStart: now,
      currentPeriodEnd: validated.interval === 'annual' 
        ? new Date(now.setFullYear(now.getFullYear() + 1))
        : new Date(now.setMonth(now.getMonth() + 1)),
      baseAmount: validated.interval === 'annual' ? tier.annualPrice : tier.basePrice,
      currentAmount: 0, // Trial = free
      totalPaid: 0,
      usersCount: 0,
      metadata: {},
    };

    // TODO: Save to database
    // TODO: Create Stripe subscription

    res.status(201).json({
      success: true,
      data: subscription,
      message: `Trial started! ${tier.trialDays} days free, then 75% off for ${tier.promoMonths} months`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/subscriptions/:id - Get subscription
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement database lookup
    throw new AppError('Not implemented', 501);
  } catch (error) {
    next(error);
  }
});

export default router;
