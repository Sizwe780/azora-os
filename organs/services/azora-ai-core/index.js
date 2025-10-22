/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

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
  res.json({ status: 'healthy', service: 'azora-ai-core', version: '1.0.0' });
});

app.get('/api/azora-ai-core', async (req, res) => {
  try {
    // Placeholder for service-specific logic
    const result = { message: 'azora-ai-core is operational', data: {} };
    logger.info('Service azora-ai-core accessed');
    res.json(result);
  } catch (error) {
    logger.error('Error in azora-ai-core:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('azora-ai-core service running on port ${PORT}');
});

module.exports = app;
