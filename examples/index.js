/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { meterApiCall } from './middleware/metering';
import * as osEconomyService from './services/osEconomyService';
import stakingService from './services/stakingService';
const authMiddleware = (req, res, next) => { req.user = { id: 'user_cuid_from_db' }; next(); };

const app = express();
app.use(express.json());

// Example: Microservice with gas metering
app.post(
  '/api/v1/ai/search',
  authMiddleware,
  meterApiCall('ai-search', 0.1),
  (req, res) => {
    res.json({ result: 'Your AI search result is...', gasCharged: 0.1 });
  }
);

// SaaS/Marketplace payment
app.post('/api/v1/saas/pay', authMiddleware, async (req, res) => {
  const userId = req.user.id, { providerUserId, amount, notes } = req.body;
  const senderWallet = await prisma.wallet.findUnique({ where: { userId } });
  const providerWallet = await prisma.wallet.findUnique({ where: { userId: providerUserId } });
  if (!senderWallet || !providerWallet) return res.status(404).json({ error: 'Wallet not found' });
  try {
    await osEconomyService.paySaaS(senderWallet.id, providerWallet.id, amount, notes);
    res.status(200).json({ message: 'Payment successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Staking endpoints
app.post('/api/v1/stake', authMiddleware, async (req, res) => {
  const userId = req.user.id, { amount, lockPeriodDays } = req.body;
  try {
    await stakingService.stake(userId, amount, lockPeriodDays);
    res.status(201).json({ message: 'Stake successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.post('/api/v1/unstake', authMiddleware, async (req, res) => {
  const userId = req.user.id, { stakingRecordId } = req.body;
  try {
    await stakingService.unstake(userId, stakingRecordId);
    res.status(200).json({ message: 'Unstake successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.get('/api/v1/wallet', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const wallet = await prisma.wallet.findUnique({ where: { userId }, include: { stakingRecords: { where: { active: true } } } });
  res.json(wallet);
});
app.post('/api/v1/admin/distribute-rewards', async (req, res) => {
  await stakingService.distributeStakingRewards();
  res.status(200).json({ message: 'Reward distribution complete' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Azora OS Economy Server running on port ${PORT}`); });