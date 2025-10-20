import { Router, Request, Response } from 'express';
import { healthCheck } from '../config/database';
import { getHealthMetrics } from '../middleware/metrics';
import DomainListing from '../models/Domain';
import logger from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/v1/health:
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
 *                   enum: [healthy, unhealthy]
 *                   example: healthy
 *                 service:
 *                   type: string
 *                   example: domain-marketplace
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected]
 *                   example: connected
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-20T10:00:00.000Z"
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     activeDomains:
 *                       type: number
 *                       example: 150
 *                     uptime:
 *                       type: number
 *                       example: 3600
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbHealthy = await healthCheck();

    // Get active domains count
    const activeDomainsCount = await DomainListing.countDocuments({
      status: { $in: ['available', 'listed'] }
    });

    // Update metrics
    const metrics = getHealthMetrics();

    const healthStatus = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      service: 'domain-marketplace',
      version: '1.0.0',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      metrics: {
        activeDomains: activeDomainsCount,
        uptime: metrics.uptime,
        memoryUsage: metrics.memory
      }
    };

    const statusCode = dbHealthy ? 200 : 503;

    res.status(statusCode).json(healthStatus);
  } catch (error: any) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'domain-marketplace',
      version: '1.0.0',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/health/ready:
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
    const dbHealthy = await healthCheck();

    if (dbHealthy) {
      res.status(200).json({
        status: 'ready',
        service: 'domain-marketplace',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        service: 'domain-marketplace',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      service: 'domain-marketplace',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/health/metrics:
 *   get:
 *     summary: Get service metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = getHealthMetrics();

    // Get domain statistics
    const stats = await DomainListing.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const domainStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        ...metrics,
        domainStats
      }
    });
  } catch (error: any) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics',
      error: error.message
    });
  }
});

export default router;