import express from 'express';
import { BillingService } from './billingService.js';

const router = express.Router();
const billingService = new BillingService();

router.get('/tier/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await billingService.getTier(userId);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/invoice', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const result = await billingService.createInvoice(userId, amount);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

router.get('/predict/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await billingService.predictTier(userId);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;