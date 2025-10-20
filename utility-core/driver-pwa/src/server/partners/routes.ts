// src/server/partners/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

// GET /api/partners/summary
router.get('/summary', async (req, res) => {
  const partnerId = req.user.partnerId; // assume auth middleware sets this for partner users
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  const pending = await prisma.payout.aggregate({
    where: { partnerId, status: 'pending' },
    _sum: { amountCents: true }
  });
  const paid = await prisma.payout.aggregate({
    where: { partnerId, status: 'paid' },
    _sum: { amountCents: true }
  });

  res.json({
    code: partner?.code ?? null,
    commissionRateBps: partner?.commissionRate ?? 0,
    pendingCents: pending._sum.amountCents ?? 0,
    paidCents: paid._sum.amountCents ?? 0
  });
});

// GET /api/partners/referrals
router.get('/referrals', async (req, res) => {
  const partnerId = req.user.partnerId;
  const referrals = await prisma.referral.findMany({
    where: { partnerId },
    include: { company: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({
    referrals: referrals.map(r => ({
      id: r.id,
      companyName: r.company.name,
      createdAt: r.createdAt
    }))
  });
});

// GET /api/partners/payouts
router.get('/payouts', async (req, res) => {
  const partnerId = req.user.partnerId;
  const payouts = await prisma.payout.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ payouts });
});

// POST /api/partners/code
router.post('/code', async (req, res) => {
  const partnerId = req.user.partnerId;
  const code = `AZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const partner = await prisma.partner.update({
    where: { id: partnerId },
    data: { code }
  });
  await writeAudit(partnerId, 'partner', 'refresh_code', { code });
  res.json({ code: partner.code });
});

// POST /api/partners/payouts
router.post('/payouts', async (req, res) => {
  const partnerId = req.user.partnerId;
  const { period } = req.body; // 'YYYY-MM'
  const total = await prisma.payout.aggregate({
    where: { partnerId, period, status: 'pending' },
    _sum: { amountCents: true }
  });
  if (!total._sum.amountCents) {
    return res.status(400).json({ error: 'No pending commissions for period' });
  }
  // In a real flow, kick off EFT batch / Paystack transfer here
  await prisma.payout.updateMany({
    where: { partnerId, period, status: 'pending' },
    data: { status: 'paid' }
  });
  await writeAudit(partnerId, 'partner', 'request_payout', { period, amountCents: total._sum.amountCents });
  res.json({ ok: true, period, amountCents: total._sum.amountCents });
});

export default router;
