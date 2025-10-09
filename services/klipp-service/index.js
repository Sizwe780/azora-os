// services/klipp-service/index.js
const express = require('express');
const bodyParser = require('body-parser');
const { generateTasks } = require('./taskGenerator');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.KLIPP_PORT || 4002;

// --- API Endpoints ---

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Klipp Service' });
});

/**
 * Endpoint to fetch available tasks for a user.
 * The request body can contain user context to help the AI find relevant tasks.
 * @route POST /tasks
 * @example body { "skills": ["smartphone_camera", "bilingual"], "location": "..." }
 */
app.post('/tasks', async (req, res) => {
  try {
    const userContext = req.body;
    const tasks = await generateTasks(userContext);
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No suitable tasks found at this time.' });
    }
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

/**
 * Endpoint to submit a completed task.
 * In a real system, this would trigger a complex verification and payment process.
 * @route POST /submit
 * @example body { "taskId": "task_001", "submission": { "photo_url": "...", "geotag": "..." } }
 */
app.post('/submit', (req, res) => {
  const { taskId, submission } = req.body;
  if (!taskId || !submission) {
    return res.status(400).json({ error: 'Task ID and submission data are required.' });
  }

  // Mock verification process
  console.log(`Received submission for task ${taskId}. Verifying...`, submission);
  
  // Mock payment process
  console.log(`Verification successful. Initiating payment for task ${taskId}.`);

  res.json({ 
    status: 'success', 
    message: `Task ${taskId} submitted successfully. Payment is being processed.` 
  });
});


app.listen(PORT, () => {
  console.log(`Klipp Service running on port ${PORT}`);
});

module.exports = app;
