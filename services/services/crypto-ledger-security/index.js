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
  res.json({ status: 'healthy', service: 'crypto-ledger-security', version: '1.0.0' });
});

app.get('/api/crypto-ledger-security', async (req, res) => {
  try {
    // Placeholder for service-specific logic
    const result = { message: 'crypto-ledger-security is operational', data: {} };
    logger.info('Service crypto-ledger-security accessed');
    res.json(result);
  } catch (error) {
    logger.error('Error in crypto-ledger-security:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('crypto-ledger-security service running on port ${PORT}');
});

module.exports = app;
