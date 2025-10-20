import express from 'express';
import { PaymentService } from './paymentService';

const router = express.Router();

router.post('/initialize', async (req, res) => {
  const { email, amount, reference, callback_url } = req.body;
  if (!email || !amount || !reference) return res.status(400).json({ error: 'Missing fields' });
  try {
    const result = await PaymentService.initializePayment(email, amount, reference, callback_url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to initialize payment', details: err });
  }
});

router.get('/verify/:reference', async (req, res) => {
  const { reference } = req.params;
  try {
    const result = await PaymentService.verifyPayment(reference);
    res.json(result);
  } catch (err) {
    const errorMessage = typeof err === 'object' && err !== null && 'message' in err ? (err as { message: string }).message : 'Failed to verify payment';
    res.status(500).json({ error: errorMessage, details: err });
  }
});

router.get('/payments', async (req, res) => {
  const { userId } = req.query;
  try {
    const payments = await PaymentService.getPayments(userId as string);
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get payments', details: err });
  }
});

export default router;