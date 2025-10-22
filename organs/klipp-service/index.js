/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

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
    const postedNeeds = [];
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
app.post('/needs', (req, res) => {
  const { title, description, price, currency, location, contact } = req.body;
  if (!title || !description || !price || !currency || !location || !contact) {
    return res.status(400).json({ error: 'All fields are required: title, description, price, currency, location, contact.' });
  }
  const need = {
    id: `need_${Date.now()}`,
    title,
    description,
    price,
    currency,
    location,
    contact,
    postedAt: new Date().toISOString()
  };
  postedNeeds.push(need);
  console.log('New need posted:', need);

  // --- AI-powered matching and alert logic ---
  // Check if any task in taskDatabase matches the need's title or description
  const { taskDatabase } = require('./taskGenerator');
  const matches = taskDatabase.filter(task =>
    need.title.toLowerCase().includes(task.title.toLowerCase()) ||
    need.description.toLowerCase().includes(task.title.toLowerCase())
  );
  if (matches.length > 0) {
    // In a real system, alert users with matching items/services
    console.log(`AI MATCH ALERT: Found ${matches.length} matching tasks for posted need '${need.title}'.`);
    matches.forEach(match => {
      console.log(` - Match: ${match.title} (${match.taskId})`);
    });
  } else {
    console.log('AI MATCH ALERT: No matching tasks found for posted need.');
  }

  res.json({ status: 'success', need, aiMatches: matches });
});
app.listen(PORT, () => {
  console.log(`Klipp Service running on port ${PORT}`);
});

module.exports = app;
