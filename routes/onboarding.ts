/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const AI_TREASURY_WALLET_ID = process.env.AI_TREASURY_WALLET_ID!;
const MARKET_BUY_HANDLER = process.env.MARKET_BUY_HANDLER!; // e.g., an Azure Function or microservice

/**
 * Onboards a new client: processes cash subscription, splits allocation, executes buy/burn, and credits wallet.
 * @param clientUserId - The client's User ID (must exist)
 * @param subscriptionUsd - The USD value of the subscription (e.g., 1000)
 */
export async function onboardClient(clientUserId: string, subscriptionUsd: number) {
  // Calculate allocations
  const buyAndBurnUsd = subscriptionUsd * 0.20;
  const walletUsd = subscriptionUsd * 0.80;
  const azrToClient = walletUsd; // 1 AZR = $1

  // 1. Market buy: AI Treasury uses $200 to buy 200 AZR from market and burns them
  // (This could be a microservice/handler or a real exchange integration)
  await marketBuyAndBurnAZR(buyAndBurnUsd);

  // 2. Credit 800 AZR to client wallet from OS reserve (if not using market buy)
  const clientWallet = await prisma.wallet.findUnique({ where: { userId: clientUserId } });
  if (!clientWallet) throw new Error('Client wallet not found');
  await prisma.$transaction([
    prisma.wallet.update({
      where: { id: clientWallet.id },
      data: { balance: { increment: azrToClient } }
    }),
    prisma.transaction.create({
      data: {
        type: 'MINT', // If you are using market buy only, this could be a TRANSFER from OS reserve
        status: 'COMPLETED',
        amount: azrToClient,
        coinType: 'AZR',
        usdEquivalent: azrToClient,
        notes: 'Client onboarding: subscription converted to AZR',
        recipientId: clientWallet.id
      }
    })
  ]);
  return { azrCredited: azrToClient, marketBuyBurn: buyAndBurnUsd };
}

/**
 * Handles the AI Treasury's market buy and burn process.
 * This can be a call to an exchange, on-chain swap, or a microservice.
 */
async function marketBuyAndBurnAZR(usdAmount: number) {
  // Pseudocode: Replace with actual exchange or handler call
  // await axios.post(MARKET_BUY_HANDLER, { usdAmount, action: 'buy_and_burn' });
  // For audit, log a BURN transaction from AI_TREASURY_WALLET_ID
  await prisma.transaction.create({
    data: {
      type: 'BURN',
      status: 'COMPLETED',
      amount: usdAmount, // 1 AZR = $1
      coinType: 'AZR',
      usdEquivalent: usdAmount,
      notes: 'AI Treasury market buy and burn',
      senderId: AI_TREASURY_WALLET_ID
    }
  });
}