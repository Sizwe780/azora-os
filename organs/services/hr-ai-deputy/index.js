const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'hr-ai-deputy', version: '1.0.0' });
});

app.get('/api/hr-ai-deputy', async (req, res) => {
  try {
    // Placeholder for service-specific logic
    const result = { message: 'hr-ai-deputy is operational', data: {} };
    logger.info('Service hr-ai-deputy accessed');
    res.json(result);
  } catch (error) {
    logger.error('Error in hr-ai-deputy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('hr-ai-deputy service running on port ${PORT}');
});

module.exports = app;
