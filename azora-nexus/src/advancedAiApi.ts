import express from 'express';
import advancedAiService from './advancedAiService.js';

const router = express.Router();

// POST /api/advanced-ai/task
router.post('/task', async (req, res) => {
  try {
    const { name } = req.body;
    const task = await advancedAiService.createTask(name);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// POST /api/advanced-ai/task/:id/process
router.post('/task/:id/process', async (req, res) => {
  try {
    const { result } = req.body;
    const processed = await advancedAiService.processTask(req.params.id, result);
    res.json(processed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process task' });
  }
});

// GET /api/advanced-ai/tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await advancedAiService.getTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

export default router;