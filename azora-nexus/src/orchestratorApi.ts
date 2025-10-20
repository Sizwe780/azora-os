import express from 'express';
import { OrchestratorService } from './orchestratorService';

const router = express.Router();

router.post('/orchestrate', async (req, res) => {
  const { userId, service, action, params } = req.body;
  if (!userId || !service || !action) return res.status(400).json({ error: 'Missing fields' });
  try {
    const result = await OrchestratorService.orchestrateService(userId, service, action, params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to orchestrate', details: err });
  }
});

router.get('/orchestrations/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const orchestrations = await OrchestratorService.getOrchestrations(userId);
    res.json({ orchestrations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get orchestrations', details: err });
  }
});

export default router;