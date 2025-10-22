/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const BOUNTY_SERVICE = process.env.BOUNTY_SERVICE_URL;
const MINTER_SERVICE = process.env.MINTER_SERVICE_URL;

// GitHub webhook handler
app.post('/webhook/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;
  
  if (event === 'push') {
    // Student pushed code using Copilot
    const commits = payload.commits.length;
    const userId = await getUserIdFromGitHub(payload.sender.login);
    
    // Award AZR for coding activity
    await axios.post(`${MINTER_SERVICE}/api/mint`, {
      userId,
      amount: commits * 5, // 5 AZR per commit
      reason: `GitHub push: ${commits} commits with Copilot`
    });
    
    console.log(`💰 Awarded ${commits * 5} AZR to ${payload.sender.login}`);
  }
  
  res.json({ received: true });
});

// Track Copilot usage and reward
app.post('/api/copilot-activity', async (req, res) => {
  const { userId, activityType, details } = req.body;
  
  const rewards = {
    'code_completion': 1,
    'code_review': 2,
    'learning_path': 5,
    'project_completion': 50
  };
  
  const amount = rewards[activityType] || 1;
  
  await axios.post(`${MINTER_SERVICE}/api/mint`, {
    userId,
    amount,
    reason: `Copilot activity: ${activityType}`
  });
  
  res.json({ success: true, earned: amount });
});

async function getUserIdFromGitHub(githubUsername) {
  // Query database for user ID by GitHub username
  return 'user-uuid-here'; // Implement actual lookup
}

const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
  console.log(`🔗 Copilot Integration running on port ${PORT}`);
});
