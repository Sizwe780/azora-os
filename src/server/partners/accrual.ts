// src/server/partners/accrual.ts
import { prisma } from '../prisma';

export async function accrueMonthly(period: string) {
  // Aggregate successful payments by company for the month and accrue partner payouts
  const payments = await prisma.payment.findMany({
    where: {
      status: 'success',
      createdAt: {
        gte: new Date(`${period}-01T00:00:00Z`),
        lt: new Date(`${period}-31T23:59:59Z`)
      }
    },
    include: { company: true }
  });

  for (const p of payments) {
    if (!p.companyId) continue;
    const referral = await prisma.referral.findFirst({
      where: { companyId: p.companyId },
      include: { partner: true }
    });
    if (!referral || !referral.partner.active) continue;

    const cents = Math.floor(p.amount * (referral.partner.commissionRate / 10000));
    await prisma.payout.create({
      data: { partnerId: referral.partnerId, amountCents: cents, status: 'pending', period }
    });
  }
}
