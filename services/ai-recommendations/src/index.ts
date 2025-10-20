import express from 'express';
import cors from 'cors';
import { aiRecommendationsService } from './aiRecommendationsService';
import { aiRecommendationsApi } from './aiRecommendationsApi';

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-recommendations',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', aiRecommendationsApi);

// Start service
async function startService() {
  try {
    await aiRecommendationsService.initialize();
    app.listen(PORT, () => {
      console.log(`AI Recommendations service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start AI Recommendations service:', error);
    process.exit(1);
  }
}

startService();