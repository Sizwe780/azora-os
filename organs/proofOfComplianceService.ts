/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const ECOSYSTEM_INCENTIVE_WALLET_ID = process.env.ECOSYSTEM_INCENTIVE_WALLET_ID!;

class ProofOfComplianceService {
  /**
   * Grants AZR from the ecosystem pool for compliance, never inflating supply.
   * @param clientWalletId - the wallet to receive reward
   * @param amount - AZR to grant
   * @param notes - optional description (e.g., "Monthly PoC Bonus Q4 2025")
   */
  async rewardCompliance(clientWalletId: string, amount: number, notes: string) {
    // 1. Confirm incentive pool has enough balance
    const poolWallet = await prisma.wallet.findUnique({ where: { id: ECOSYSTEM_INCENTIVE_WALLET_ID } });
    if (!poolWallet || poolWallet.balance < amount) throw new Error('Insufficient incentive pool balance');
    // 2. Atomic grant: debit pool, credit client, log transaction
    await prisma.$transaction([
      prisma.wallet.update({ where: { id: ECOSYSTEM_INCENTIVE_WALLET_ID }, data: { balance: { decrement: amount } } }),
      prisma.wallet.update({ where: { id: clientWalletId }, data: { balance: { increment: amount } } }),
      prisma.transaction.create({
        data: {
          type: 'GRANT',
          status: 'COMPLETED',
          amount,
          coinType: 'AZR',
          usdEquivalent: amount,
          notes,
          senderId: ECOSYSTEM_INCENTIVE_WALLET_ID,
          recipientId: clientWalletId
        }
      })
    ]);
    return { granted: amount, to: clientWalletId };
  }
}

export default new ProofOfComplianceService();