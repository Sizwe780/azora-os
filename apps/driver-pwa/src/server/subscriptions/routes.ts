// src/server/subscriptions/routes.ts
import express, { Request, Response } from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

// Interfaces for type safety
interface PlanChangeRequest {
  companyId: string;
  planCode: string;
}

interface CancelRequest {
  companyId: string;
}

// Utility to calculate next period end
function nextPeriodEnd(interval: 'monthly' | 'annual'): Date {
  const now = new Date();
  const end = new Date(now);
  if (interval === 'monthly') end.setMonth(end.getMonth() + 1);
  else end.setFullYear(end.getFullYear() + 1);
  return end;
}

// Utility to update company subscription status
async function updateCompanySubscriptionStatus(companyId: string, status: 'active' | 'canceled'): Promise<void> {
  try {
    await prisma.company.update({
      where: { id: companyId },
      data: { subscriptionStatus: status },
    });
  } catch (error) {
    throw new Error(`Failed to update company status: ${error.message}`);
  }
}

// GET /api/plans
router.get('/plans', async (_req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { priceZarCents: 'asc' },
    });
    res.json({ plans });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// GET /api/subscriptions/:companyId
router.get('/subscriptions/:companyId', async (req: Request, res: Response) => {
  const { companyId } = req.params;

  if (!companyId) {
    return res.status(400).json({ error: 'Company ID is required' });
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { companyId, status: { in: ['active', 'past_due'] } },
      include: { plan: true },
    });
    res.json({ subscription: subscription || null });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch subscription: ${error.message}` });
  }
});

// POST /api/subscriptions/change
router.post('/subscriptions/change', async (req: Request, res: Response) => {
  const { companyId, planCode }: PlanChangeRequest = req.body;

  // Input validation
  if (!companyId || !planCode) {
    return res.status(400).json({ error: 'Company ID and plan code are required' });
  }

  try {
    const plan = await prisma.plan.findUnique({ where: { code: planCode } });
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan code' });
    }

    const subscription = await prisma.subscription.upsert({
      where: { companyId },
      update: {
        planId: plan.id,
        status: 'active',
        currentPeriodEnd: nextPeriodEnd(plan.interval),
      },
      create: {
        companyId,
        planId: plan.id,
        status: 'active',
        provider: 'paystack',
        currentPeriodEnd: nextPeriodEnd(plan.interval),
      },
    });

    await updateCompanySubscriptionStatus(companyId, 'active');

    // Audit log aligned with POPIA
    await writeAudit({
      uid: `sub-${companyId}-${planCode}`,
      companyId,
      type: 'SUBSCRIPTION',
      targetId: companyId,
      meta: { action: 'change_plan', planCode },
    });

    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ error: `Failed to change subscription: ${error.message}` });
  }
});

// POST /api/subscriptions/cancel
router.post('/subscriptions/cancel', async (req: Request, res: Response) => {
  const { companyId }: CancelRequest = req.body;

  if (!companyId) {
    return res.status(400).json({ error: 'Company ID is required' });
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { companyId, status: 'active' },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    await prisma.subscription.updateMany({
      where: { companyId, status: 'active' },
      data: { status: 'canceled' },
    });

    await updateCompanySubscriptionStatus(companyId, 'canceled');

    // Audit log aligned with POPIA
    await writeAudit({
      uid: `sub-${companyId}-cancel`,
      companyId,
      type: 'SUBSCRIPTION',
      targetId: companyId,
      meta: { action: 'cancel_subscription' },
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: `Failed to cancel subscription: ${error.message}` });
  }
});

export default router;