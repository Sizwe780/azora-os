import express from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY as string;

// Validate signature
function isValidSignature(req: express.Request) {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  return hash === (req.headers['x-paystack-signature'] as string);
}

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
  if (!isValidSignature(req)) return res.status(401).send('Invalid signature');

  const event = req.body?.event as string | undefined;
  const data = req.body?.data as any;

  try {
    // One‑time charge success
    if (event === 'charge.success') {
      const reference: string = data.reference;
      const amount: number = data.amount;
      const currency: string = data.currency;

      await prisma.payment.upsert({
        where: { reference },
        update: { status: 'success', amount, currency, raw: data },
        create: {
          reference,
          status: 'success',
          provider: 'paystack',
          amount,
          currency,
          raw: data
        }
      });

      const companyId: string | undefined = data.metadata?.companyId;
      if (companyId) {
        await prisma.company.update({
          where: { id: companyId },
          data: {
            pilotActive: true,
            pilotActivatedAt: new Date(),
            subscriptionStatus: 'active'
          }
        });

        await writeAudit({
          uid: reference,
          companyId,
          type: 'PAYMENT',
          targetId: reference,
          meta: { amount, currency, provider: 'paystack' }
        });
      }
    }

    // Subscription payment failed
    if (event === 'invoice.payment_failed') {
      const companyId: string | undefined = data.customer?.metadata?.companyId;
      if (companyId) {
        await prisma.company.update({
          where: { id: companyId },
          data: { subscriptionStatus: 'past_due' }
        });
        await prisma.subscription.updateMany({
          where: { companyId },
          data: { status: 'past_due' }
        });

        await writeAudit({
          uid: data.invoice_code,
          companyId,
          type: 'SUBSCRIPTION',
          targetId: data.invoice_code,
          meta: { status: 'payment_failed' }
        });
      }
    }

    // Subscription payment succeeded
    if (event === 'invoice.payment_succeeded') {
      const companyId: string | undefined = data.customer?.metadata?.companyId;
      if (companyId) {
        await prisma.company.update({
          where: { id: companyId },
          data: { subscriptionStatus: 'active' }
        });
        await prisma.subscription.updateMany({
          where: { companyId },
          data: {
            status: 'active',
            currentPeriodEnd: new Date(data.next_payment_date)
          }
        });

        await writeAudit({
          uid: data.invoice_code,
          companyId,
          type: 'SUBSCRIPTION',
          targetId: data.invoice_code,
          meta: { status: 'payment_succeeded' }
        });
      }
    }

    res.json({ received: true });
  } catch (e) {
    console.error('Webhook handling error', e);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
