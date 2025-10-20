import express from 'express';
import cors from 'cors';
import { aiUnifiedService } from './aiUnifiedService';
import { aiUnifiedApi } from './aiUnifiedApi';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-unified',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', aiUnifiedApi);

// Start service
async function startService() {
  try {
    await aiUnifiedService.initialize();
    app.listen(PORT, () => {
      console.log(`AI Unified service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start AI Unified service:', error);
    process.exit(1);
  }
}

startService();