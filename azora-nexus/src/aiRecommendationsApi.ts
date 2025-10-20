import express from 'express';
import { aiRecommendationsService } from './aiRecommendationsService';

const router = express.Router();

// Get recommendations for a user
router.post('/recommend', async (req, res) => {
  try {
    const { userId, context, limit } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const recommendations = await aiRecommendationsService.getRecommendations(
      userId,
      context || {},
      limit || 10
    );

    res.json({ recommendations });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Log user interaction
router.post('/interactions', async (req, res) => {
  try {
    const { userId, type, itemId, recommendationId, metadata } = req.body;

    if (!userId || !type || !itemId) {
      return res.status(400).json({ error: 'userId, type, and itemId are required' });
    }

    await aiRecommendationsService.logInteraction(userId, type, itemId, recommendationId, metadata);

    res.status(201).json({ message: 'Interaction logged successfully' });
  } catch (error) {
    console.error('Error logging interaction:', error);
    res.status(500).json({ error: 'Failed to log interaction' });
  }
});

// Update user profile
router.put('/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences, demographics } = req.body;

    if (!preferences) {
      return res.status(400).json({ error: 'preferences are required' });
    }

    const profile = await aiRecommendationsService.updateUserProfile(userId, preferences, demographics);

    res.json({ profile });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get user profile
router.get('/profiles/:userId', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const { userId } = req.params;
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Get audit logs
router.get('/audit', async (req, res) => {
  try {
    const { entityId, entityType, limit } = req.query;

    const logs = await aiRecommendationsService.getAuditLogs(
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

export { router as aiRecommendationsApi };