/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description Manages the user onboarding journey, tracking progress and providing the next step.
 */
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.ONBOARDING_PORT || 4200;
const PROOF_API_URL = 'http://localhost:4210/api/log';

const userProgress = {
  'nmu_student_1': { track: 'nmu_student', currentStep: 0 }
};

const onboardingTracks = {
  'nmu_student': [
    { step: 0, title: 'Welcome, NMU Student! Let\'s set up your wallet to start earning.', action: { type: 'navigate', payload: '/wallet' }, reward: 0.5, proofType: 'onboarding_started' },
    { step: 1, title: 'Use the AI to find library hours and earn 1 AZR.', action: { type: 'prompt_ai', payload: 'what are the library hours?' }, reward: 1, proofType: 'ai_usage_academic' },
    { step: 2, title: 'Check the system status in Mission Control to earn 0.5 AZR.', action: { type: 'navigate', payload: '/monitoring/mission-control' }, reward: 0.5, proofType: 'compliance_check' },
    { step: 3, title: 'Onboarding Complete! You earned 2 AZR!', action: { type: 'inform' }, reward: 0, proofType: 'onboarding_complete' }
  ]
};

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

app.get('/api/onboarding/:userId', (req, res) => {
  const { userId } = req.params;
  const progress = userProgress[userId] || { track: 'nmu_student', currentStep: 0 };
  const track = onboardingTracks[progress.track];
  const nextStep = track[progress.currentStep];
  res.json(nextStep || track[track.length - 1]);
});

app.post('/api/onboarding/:userId/complete', async (req, res) => {
  const { userId } = req.params;
  const progress = userProgress[userId];
  if (!progress) return res.status(404).json({ error: 'User not found' });

  const track = onboardingTracks[progress.track];
  const completedStep = track[progress.currentStep];

  // Log the proof of completion and trigger the reward
  if (completedStep && completedStep.reward > 0) {
    try {
      await fetch(PROOF_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          proofType: completedStep.proofType,
          description: completedStep.title,
          coinValue: completedStep.reward
        })
      });
    } catch (error) {
      console.error('Failed to log proof:', error.message);
    }
  }

  if (progress.currentStep < track.length - 1) {
    progress.currentStep++;
  }
  res.status(200).json({ message: 'Progress saved.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Onboarding Service is online on port ${PORT}`);
});
