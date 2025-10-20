import express from 'express';
import cors from 'cors';
import { aiValuationService } from './aiValuationService';
import { aiValuationApi } from './aiValuationApi';

const app = express();
const PORT = process.env.PORT || 4125;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-valuation',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', aiValuationApi);

// Start service
async function startService() {
  try {
    await aiValuationService.initialize();
    app.listen(PORT, () => {
      console.log(`AI Valuation service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start AI Valuation service:', error);
    process.exit(1);
  }
}

startService();