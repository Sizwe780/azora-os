/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function consumeGas(userWalletId: string, microservice: string, gasAmount: number) {
  await prisma.$transaction([
    prisma.wallet.update({ where: { id: userWalletId }, data: { balance: { decrement: gasAmount } } }),
    prisma.transaction.create({
      data: {
        type: 'GAS',
        status: 'COMPLETED',
        amount: gasAmount,
        coinType: 'AZR',
        usdEquivalent: gasAmount,
        notes: `Gas for ${microservice}`,
        senderId: userWalletId,
        microservice
      }
    })
  ]);
  await processTreasuryDistribution(gasAmount, userWalletId, microservice);
}

export async function paySaaS(userWalletId: string, providerWalletId: string, amount: number, notes: string) {
  await prisma.$transaction([
    prisma.wallet.update({ where: { id: userWalletId }, data: { balance: { decrement: amount } } }),
    prisma.wallet.update({ where: { id: providerWalletId }, data: { balance: { increment: amount } } }),
    prisma.transaction.create({
      data: {
        type: 'SaaS_PAYMENT',
        status: 'COMPLETED',
        amount,
        coinType: 'AZR',
        usdEquivalent: amount,
        notes,
        senderId: userWalletId,
        recipientId: providerWalletId
      }
    })
  ]);
}

export async function processTreasuryDistribution(amount: number, userWalletId: string, microservice: string) {
  const burn = amount * 0.5;
  const reward = amount * 0.3;
  const grant = amount * 0.2;
  await prisma.burnLog.create({ data: { amount: burn, notes: `Auto-burn from ${microservice}` } });
  await prisma.transaction.create({
    data: {
      type: 'BURN',
      status: 'COMPLETED',
      amount: burn,
      coinType: 'AZR',
      usdEquivalent: 0,
      notes: `Burn from OS gas`,
      senderId: userWalletId
    }
  });
  await prisma.transaction.create({
    data: {
      type: 'REWARD',
      status: 'COMPLETED',
      amount: reward,
      coinType: 'AZR',
      usdEquivalent: reward,
      notes: `OS gas reward to stakers`,
      senderId: userWalletId,
      recipientId: process.env.STAKING_POOL_WALLET_ID
    }
  });
  await prisma.wallet.update({
    where: { id: process.env.STAKING_POOL_WALLET_ID },
    data: { balance: { increment: reward } }
  });
  await prisma.transaction.create({
    data: {
      type: 'GRANT',
      status: 'COMPLETED',
      amount: grant,
      coinType: 'AZR',
      usdEquivalent: grant,
      notes: `Dev grant from OS gas`,
      senderId: userWalletId,
      recipientId: process.env.DEV_GRANT_POOL_WALLET_ID
    }
  });
  await prisma.wallet.update({
    where: { id: process.env.DEV_GRANT_POOL_WALLET_ID },
    data: { balance: { increment: grant } }
  });
}