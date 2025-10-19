import express from 'express';
import ProofOfComplianceService from '../services/proofOfComplianceService';
const router = express.Router();

router.post('/poc/reward', async (req, res) => {
  const { clientWalletId, amount, notes } = req.body;
  try {
    const result = await ProofOfComplianceService.rewardCompliance(clientWalletId, amount, notes);
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;