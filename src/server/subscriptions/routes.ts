// src/server/subscriptions/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

// GET /api/plans
router.get('/plans', async (_req, res) => {
  const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { priceZarCents: 'asc' } });
  res.json({ plans });
});

// GET /api/subscriptions/:companyId
router.get('/subscriptions/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const sub = await prisma.subscription.findFirst({
    where: { companyId, status: { in: ['active', 'past_due'] } },
    include: { plan: true }
  });
  res.json({ subscription: sub || null });
});

// POST /api/subscriptions/change
// POST /api/subscriptions/change
router.post('/subscriptions/change', async (req, res) => {
    const { companyId, planCode } = req.body;
    const plan = await prisma.plan.findUnique({ where: { code: planCode } });
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });
  
    const sub = await prisma.subscription.upsert({
      where: { companyId },
      update: { planId: plan.id, status: 'active', currentPeriodEnd: nextPeriodEnd(plan.interval) },
      create: {
        companyId,
        planId: plan.id,
        status: 'active',
        provider: 'paystack',
        currentPeriodEnd: nextPeriodEnd(plan.interval)
      }
    });
  
    await prisma.company.update({ where: { id: companyId }, data: { subscriptionStatus: 'active' } });
  
    await writeAudit({
      uid: `sub-${companyId}-${planCode}`,
      companyId,
      type: 'SUBSCRIPTION',
      targetId: companyId,
      meta: { action: 'change_plan', planCode }
    });
  
    res.json({ subscription: sub });
  });
  
  // POST /api/subscriptions/cancel
  router.post('/subscriptions/cancel', async (req, res) => {
    const { companyId } = req.body;
    await prisma.subscription.updateMany({
      where: { companyId, status: 'active' },
      data: { status: 'canceled' }
    });
    await prisma.company.update({ where: { id: companyId }, data: { subscriptionStatus: 'canceled' } });
  
    await writeAudit({
      uid: `sub-${companyId}-cancel`,
      companyId,
      type: 'SUBSCRIPTION',
      targetId: companyId,
      meta: { action: 'cancel' }
    });
  
    res.json({ ok: true });
  });
  

  await prisma.company.update({ where: { id: companyId }, data: { subscriptionStatus: 'active' } });
  await writeAudit(companyId, 'subscription', 'change_plan', { planCode });
  res.json({ subscription: sub });
});

// POST /api/subscriptions/cancel
router.post('/subscriptions/cancel', async (req, res) => {
  const { companyId } = req.body;
  await prisma.subscription.updateMany({
    where: { companyId, status: 'active' },
    data: { status: 'canceled' }
  });
  await prisma.company.update({ where: { id: companyId }, data: { subscriptionStatus: 'canceled' } });
  await writeAudit(companyId, 'subscription', 'cancel', {
      name: undefined,
      vatNumber: undefined,
      vatPercent: undefined,
      popiaConsent: undefined
  });
  res.json({ ok: true });
});

function nextPeriodEnd(interval: 'monthly' | 'annual') {
  const now = new Date();
  const end = new Date(now);
  if (interval === 'monthly') end.setMonth(end.getMonth() + 1);
  else end.setFullYear(end.getFullYear() + 1);
  return end;
}

export default router;
