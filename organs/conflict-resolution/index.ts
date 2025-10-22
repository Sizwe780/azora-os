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
import conflictRoutes from './src/routes/conflict.routes';
import protocolRoutes from './src/routes/protocol.routes';
import aiRoutes from './src/routes/ai.routes';
import reputationRoutes from './src/routes/reputation.routes';
import blockchainRoutes from './src/routes/blockchain.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5200;

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
    service: 'conflict-resolution-engine',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    phase: 'Phase 5 - Federated Conflict Resolution Engine',
    nobelNomination: '2026',
    tagline: 'Architecting Peace Through Code',
  });
});

// API Routes
app.use('/api/v1/conflicts', authMiddleware, conflictRoutes);
app.use('/api/v1/protocols', authMiddleware, protocolRoutes);
app.use('/api/v1/ai', authMiddleware, aiRoutes);
app.use('/api/v1/reputation', authMiddleware, reputationRoutes);
app.use('/api/v1/blockchain', authMiddleware, blockchainRoutes);

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
  logger.info(`☮️  AZORA Conflict Resolution Engine started on port ${PORT}`);
  logger.info(`🏆 Phase 5: Federated Conflict Resolution Engine`);
  logger.info(`🌍 Mission: Architecting Peace Through Code`);
  logger.info(`🥇 Nobel Peace Prize Nomination: 2026`);
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
