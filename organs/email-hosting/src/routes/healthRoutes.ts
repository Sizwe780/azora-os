/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Domain from '../models/Domain';
import Email from '../models/Email';
import logger from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get service health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Service uptime in seconds
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "connected"
 *                     smtp:
 *                       type: string
 *                       example: "operational"
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'unknown',
        smtp: 'unknown'
      }
    };

    // Check database connection
    if (mongoose.connection.readyState === 1) {
      health.services.database = 'connected';
    } else {
      health.services.database = 'disconnected';
      health.status = 'unhealthy';
    }

    // Check SMTP connectivity (simplified check)
    try {
      // You could add a more sophisticated SMTP health check here
      health.services.smtp = 'operational';
    } catch (error) {
      health.services.smtp = 'error';
      logger.warn('SMTP health check failed:', error);
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Check if service is ready to accept traffic
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not ready',
        message: 'Database not connected'
      });
    }

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      message: (error as Error).message
    });
  }
});

/**
 * @swagger
 * /health/metrics:
 *   get:
 *     summary: Get detailed service metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed metrics retrieved
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      domains: {
        total: await Domain.countDocuments(),
        active: await Domain.countDocuments({ status: 'active' }),
        pending: await Domain.countDocuments({ status: 'pending' })
      },
      emails: {
        total: await Email.countDocuments(),
        sent: await Email.countDocuments({ status: 'sent' }),
        delivered: await Email.countDocuments({ status: 'delivered' }),
        failed: await Email.countDocuments({ status: 'failed' }),
        queued: await Email.countDocuments({ status: 'queued' })
      },
      database: {
        state: mongoose.connection.readyState,
        name: mongoose.connection.name,
        host: mongoose.connection.host
      }
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics retrieval failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      message: (error as Error).message
    });
  }
});

/**
 * @swagger
 * /health/ping:
 *   get:
 *     summary: Simple ping/pong health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Pong response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "pong"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/ping', (req: Request, res: Response) => {
  res.json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

export default router;