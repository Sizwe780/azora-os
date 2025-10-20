import express from 'express';
import { aiUnifiedService } from './aiUnifiedService';

const router = express.Router();

// Create a new unified AI task
router.post('/tasks', async (req, res) => {
  try {
    const { taskType, inputData, priority } = req.body;

    if (!taskType || !inputData) {
      return res.status(400).json({ error: 'taskType and inputData are required' });
    }

    const taskId = await aiUnifiedService.createTask(taskType, inputData, priority || 1);

    res.status(201).json({ taskId });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get task status
router.get('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const taskStatus = await aiUnifiedService.getTaskStatus(taskId);

    res.json(taskStatus);
  } catch (error) {
    console.error('Error getting task status:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to get task status' });
    }
  }
});

// Register a new AI model
router.post('/models', async (req, res) => {
  try {
    const { name, provider, modelType, capabilities } = req.body;

    if (!name || !provider || !modelType || !capabilities) {
      return res.status(400).json({ error: 'name, provider, modelType, and capabilities are required' });
    }

    const modelId = await aiUnifiedService.registerModel(name, provider, modelType, capabilities);

    res.status(201).json({ modelId });
  } catch (error) {
    console.error('Error registering model:', error);
    res.status(500).json({ error: 'Failed to register model' });
  }
});

// Get audit logs
router.get('/audit', async (req, res) => {
  try {
    const { entityId, entityType, limit } = req.query;

    const logs = await aiUnifiedService.getAuditLogs(
      entityId as string,
      entityType as string,
      limit ? parseInt(limit as string) : 50
    );

    res.json({ logs });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

export { router as aiUnifiedApi };