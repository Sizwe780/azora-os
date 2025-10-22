/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import { healthCheck } from '../config/database';
import { customMetrics } from '../middleware/metrics';
import logger from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await healthCheck();

    if (dbHealthy) {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ai-website-builder',
      });
    } else {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'ai-website-builder',
        issues: ['Database connection failed'],
      });
    }
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'ai-website-builder',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/v1/health/ready:
 *   get:
 *     summary: Readiness check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await healthCheck();

    if (dbHealthy) {
      res.json({
        success: true,
        status: 'ready',
        timestamp: new Date().toISOString(),
        service: 'ai-website-builder',
        checks: {
          database: 'healthy',
        },
      });
    } else {
      res.status(503).json({
        success: false,
        status: 'not ready',
        timestamp: new Date().toISOString(),
        service: 'ai-website-builder',
        checks: {
          database: 'unhealthy',
        },
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      success: false,
      status: 'not ready',
      timestamp: new Date().toISOString(),
      service: 'ai-website-builder',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/v1/health/metrics:
 *   get:
 *     summary: Service metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Prometheus metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  // Metrics are handled by the prometheus-api-metrics middleware
  // This endpoint is just for documentation
  res.json({
    success: true,
    message: 'Metrics available at this endpoint',
  });
});

/**
 * @swagger
 * /api/v1/health/stats:
 *   get:
 *     summary: Service statistics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // This would typically aggregate statistics from the database
    // For now, return basic info
    res.json({
      success: true,
      data: {
        service: 'ai-website-builder',
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
      },
    });
  } catch (error) {
    logger.error('Stats check failed:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get service statistics',
        statusCode: 500,
      },
    });
  }
});

export default router;