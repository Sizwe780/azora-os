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
  res.json({ status: 'healthy', service: 'compliance-dashboard', version: '1.0.0' });
});

app.get('/api/compliance-dashboard', async (req, res) => {
  try {
    // Placeholder for service-specific logic
    const result = { message: 'compliance-dashboard is operational', data: {} };
    logger.info('Service compliance-dashboard accessed');
    res.json(result);
  } catch (error) {
    logger.error('Error in compliance-dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('compliance-dashboard service running on port ${PORT}');
});

module.exports = app;
