import express from 'express';
import aiMlService from './aiMlService.js';

const router = express.Router();

// POST /api/ai-ml/train
router.post('/train', async (req, res) => {
  try {
    const { name, algorithm } = req.body;
    const result = await aiMlService.trainModel(name, algorithm);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to train model' });
  }
});

// GET /api/ai-ml/models
router.get('/models', async (req, res) => {
  try {
    const models = await aiMlService.getModels();
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get models' });
  }
});

// POST /api/ai-ml/data
router.post('/data', async (req, res) => {
  try {
    const { dataset, size, features } = req.body;
    const data = await aiMlService.addTrainingData(dataset, size, features);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add training data' });
  }
});

export default router;