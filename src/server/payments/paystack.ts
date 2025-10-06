// name=src/server/payments/paystack.ts
import express from 'express';
import fetch from 'node-fetch';
import { prisma } from '../prisma'; // your Prisma client

const router = express.Router();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY as string;

router.post('/verify', async (req, res) => {
  const { reference, userId, companyId, planCode } = req.body; // planCode optional for subscriptions
  if (!reference) return res.status(400).json({ error: 'Missing reference' });

  const resp = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
  });
  const data = await resp.json();

  if (data.status && data.data.status === 'success') {
    // Record payment
    await prisma.payment.create({
      data: {
        reference,
        amount: data.data.amount, // in kobo/cents
        currency: data.data.currency,
        status: 'success',
        userId,
        companyId,
        provider: 'paystack',
        raw: data.data
      }
    });

    // Activate pilot/subscription
    await prisma.company.update({
      where: { id: companyId },
      data: {
        pilotActive: true,
        pilotActivatedAt: new Date(),
        subscriptionStatus: planCode ? 'active' : 'none'
      }
    });

    return res.json({ ok: true, message: 'Payment verified and pilot activated' });
  }

  return res.status(402).json({ error: 'Payment not successful', details: data });
});

export default router;
