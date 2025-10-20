import express from 'express';
import aiEvolutionService from './aiEvolutionService.js';

const router = express.Router();

// POST /api/ai-evolution/evolve
router.post('/evolve', async (req, res) => {
  try {
    const { generation, fitness, parameters } = req.body;
    const evolution = await aiEvolutionService.createEvolution(generation, fitness, parameters);
    res.json(evolution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create evolution' });
  }
});

// GET /api/ai-evolution/evolutions
router.get('/evolutions', async (req, res) => {
  try {
    const evolutions = await aiEvolutionService.getEvolutions();
    res.json(evolutions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get evolutions' });
  }
});

// POST /api/ai-evolution/model/:id/evolve
router.post('/model/:id/evolve', async (req, res) => {
  try {
    const { newVersion, accuracy } = req.body;
    const result = await aiEvolutionService.evolveModel(req.params.id, newVersion, accuracy);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to evolve model' });
  }
});

export default router;