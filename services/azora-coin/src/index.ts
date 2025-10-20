import express from 'express';
import { CoinService } from './coinService.js';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.json());
const prisma = new PrismaClient();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-coin' });
});

// Register user (with KYC status)
app.post('/register', async (req, res) => {
  const { email, jurisdiction } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        email,
        jurisdiction,
        kycStatus: 'PENDING',
        wallet: { create: { balance: 0.0, coinType: 'AZR' } },
      },
      include: { wallet: true },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Mint coins
app.post('/mint', async (req, res) => {
  const { userId, amount, coinType, notes, originDatumId } = req.body;
  try {
    const txn = await CoinService.mint(userId, amount, coinType, notes, originDatumId);
    res.status(201).json(txn);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Transfer coins
app.post('/transfer', async (req, res) => {
  const { senderId, recipientId, amount, coinType, notes } = req.body;
  try {
    const txn = await CoinService.transfer(senderId, recipientId, amount, coinType, notes);
    res.status(201).json(txn);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Withdraw coins
app.post('/withdraw', async (req, res) => {
  const { userId, amount, notes } = req.body;
  try {
    const txn = await CoinService.withdraw(userId, amount, notes);
    res.status(201).json(txn);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get wallet info
app.get('/wallet/:userId', async (req, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.params.userId } });
    res.json(wallet);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get transaction history
app.get('/history/:userId', async (req, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.params.userId } });
    if (!wallet) return res.json([]);
    const txns = await prisma.transaction.findMany({
      where: { OR: [{ senderId: wallet.id }, { recipientId: wallet.id }] },
      orderBy: { createdAt: 'desc' },
    });
    res.json(txns);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

const PORT = process.env.AZORA_COIN_PORT || 6700;
app.listen(PORT, () => console.log(`[azora-coin] running on ${PORT}`));
