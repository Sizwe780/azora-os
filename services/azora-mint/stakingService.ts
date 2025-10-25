/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const STAKING_POOL_WALLET_ID = process.env.STAKING_POOL_WALLET_ID!;

class StakingService {
  async stake(userId: string, amount: number, lockPeriodDays: number) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.balance < amount) throw new Error('Insufficient AZR balance');
    const apy = lockPeriodDays > 180 ? 0.10 : 0.05;

    return prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount }, staked: { increment: amount } }
      }),
      prisma.staking.create({
        data: { walletId: wallet.id, amount, lockPeriod: lockPeriodDays, apy, active: true }
      }),
      prisma.transaction.create({
        data: {
          type: 'STAKE',
          status: 'COMPLETED',
          amount,
          coinType: 'AZR',
          usdEquivalent: amount,
          notes: `Staked for ${lockPeriodDays} days @ ${apy * 100}%`,
          senderId: wallet.id
        }
      })
    ]);
  }

  async unstake(userId: string, stakingRecordId: string) {
    const stake = await prisma.staking.findUnique({ where: { id: stakingRecordId }, include: { wallet: true } });
    if (!stake || stake.wallet.userId !== userId) throw new Error('Staking record not found or permission denied');
    if (stake.active === false) throw new Error('Stake is already inactive');
    const lockEndDate = new Date(stake.startDate.getTime() + stake.lockPeriod * 24 * 60 * 60 * 1000);
    if (new Date() < lockEndDate) throw new Error(`Lock period not over. Can unstake on ${lockEndDate.toISOString()}`);

    return prisma.$transaction([
      prisma.wallet.update({ where: { id: stake.walletId }, data: { balance: { increment: stake.amount }, staked: { decrement: stake.amount } } }),
      prisma.staking.update({ where: { id: stakingRecordId }, data: { active: false, endDate: new Date() } }),
      prisma.transaction.create({
        data: {
          type: 'UNSTAKE',
          status: 'COMPLETED',
          amount: stake.amount,
          coinType: 'AZR',
          usdEquivalent: stake.amount,
          notes: `Unstaked record ${stakingRecordId}`,
          recipientId: stake.walletId
        }
      })
    ]);
  }

  async distributeStakingRewards() {
    const stakingPoolWallet = await prisma.wallet.findUnique({ where: { id: STAKING_POOL_WALLET_ID } });
    const rewardPie = stakingPoolWallet?.balance || 0;
    if (rewardPie <= 0) return;
    const totalStakedResult = await prisma.staking.aggregate({ _sum: { amount: true }, where: { active: true } });
    const totalStaked = totalStakedResult._sum.amount || 0;
    if (totalStaked === 0) return;
    const rewardRate = rewardPie / totalStaked;
    const allStakes = await prisma.staking.findMany({ where: { active: true } });
    const rewardTransactions: any[] = [];
    for (const stake of allStakes) {
      const rewardAmount = stake.amount * rewardRate;
      rewardTransactions.push(
        prisma.wallet.update({ where: { id: stake.walletId }, data: { balance: { increment: rewardAmount } } }),
        prisma.transaction.create({
          data: {
            type: 'REWARD', status: 'COMPLETED', amount: rewardAmount, coinType: 'AZR',
            usdEquivalent: rewardAmount, notes: `Staking reward for stake ${stake.id} @ rate ${rewardRate}`,
            senderId: STAKING_POOL_WALLET_ID, recipientId: stake.walletId
          }
        }),
        prisma.staking.update({ where: { id: stake.id }, data: { rewardsPaid: { increment: rewardAmount } } })
      );
    }
    rewardTransactions.push(prisma.wallet.update({ where: { id: STAKING_POOL_WALLET_ID }, data: { balance: 0 } }));
    await prisma.$transaction(rewardTransactions);
  }
}

export default new StakingService();