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
  res.json({ status: 'healthy', service: 'first_mover_exchange', version: '1.0.0' });
});

app.get('/api/first_mover_exchange', async (req, res) => {
  try {
    // Placeholder for service-specific logic
    const result = { message: 'first_mover_exchange is operational', data: {} };
    logger.info('Service first_mover_exchange accessed');
    res.json(result);
  } catch (error) {
    logger.error('Error in first_mover_exchange:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('first_mover_exchange service running on port ${PORT}');
});

module.exports = app;
