/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './src/utils/logger';
import { errorHandler } from './src/middleware/errorHandler';
import { authMiddleware } from './src/middleware/auth';

// Routes
import tenderRoutes from './src/routes/tender.routes';
import bidRoutes from './src/routes/bid.routes';
import complianceRoutes from './src/routes/compliance.routes';
import blockchainRoutes from './src/routes/blockchain.routes';
import corruptionRoutes from './src/routes/corruption.routes';
import subscriptionRoutes from './src/routes/subscription.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5100;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    service: 'procurement-corridor',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    phase: 'Phase 1 - Sovereign Immune System',
  });
});

// API Routes
app.use('/api/v1/tenders', authMiddleware, tenderRoutes);
app.use('/api/v1/bids', authMiddleware, bidRoutes);
app.use('/api/v1/compliance', authMiddleware, complianceRoutes);
app.use('/api/v1/blockchain', authMiddleware, blockchainRoutes);
app.use('/api/v1/corruption', authMiddleware, corruptionRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🏛️  AZORA Procurement Corridor started on port ${PORT}`);
  logger.info(`📋 Phase 1: Tender Portal + Blockchain + Compliance + Corruption AI`);
  logger.info(`🛡️  Sovereign Immune System ACTIVE`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
