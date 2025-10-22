/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { metricsMiddleware } from './middleware/metrics';
import domainRoutes from './routes/domainRoutes';
import smtpRoutes from './routes/smtpRoutes';
import emailRoutes from './routes/emailRoutes';
import healthRoutes from './routes/healthRoutes';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use(requestLogger);
app.use(rateLimiter);
app.use(metricsMiddleware);

// Swagger documentation
setupSwagger(app);

// Routes
app.use('/api/v1/domains', domainRoutes);
app.use('/api/v1/smtp', smtpRoutes);
app.use('/api/v1/emails', emailRoutes);
app.use('/health', healthRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`🚀 Email Hosting Service running on port ${PORT}`);
      logger.info(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
      logger.info(`📊 Metrics available at http://localhost:${PORT}/metrics`);
      logger.info(`❤️  Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start Email Hosting Service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();