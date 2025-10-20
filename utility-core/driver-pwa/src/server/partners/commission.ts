// name=src/server/partners/commission.ts
import { prisma } from '../prisma';

export async function accrueCommissions(period: string) {
  const payments = await prisma.payment.findMany({
    where: { status: 'success' },
    include: { company: true }
  });

  for (const p of payments) {
    const referral = await prisma.referral.findFirst({
      where: { companyId: p.companyId! },
      include: { partner: true }
    });
    if (!referral || !referral.partner.active) continue;

    const amountCents = Math.floor(p.amount * (referral.partner.commissionRate / 10000));
    await prisma.payout.create({
      data: {
        partnerId: referral.partnerId,
        amountCents,
        status: 'pending',
        period
      }
    });
  }
}
