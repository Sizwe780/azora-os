/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { apiGatewayService } from './apiGatewayService';

const router = express.Router();

/**
 * @swagger
 * /api/routes:
 *   post:
 *     summary: Register a new service route
 *     description: Registers a new route for service routing through the API Gateway
 *     tags: [Routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceName
 *               - route
 *               - targetUrl
 *             properties:
 *               serviceName:
 *                 type: string
 *                 description: Name of the service
 *               route:
 *                 type: string
 *                 description: Route path (e.g., "/api/users")
 *               targetUrl:
 *                 type: string
 *                 description: Target service URL (e.g., "http://user-service:3001")
 *               method:
 *                 type: string
 *                 enum: [GET, POST, PUT, DELETE, PATCH]
 *                 description: HTTP method (defaults to GET)
 *     responses:
 *       201:
 *         description: Route registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routeId:
 *                   type: string
 *                   description: Unique identifier for the registered route
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/routes', async (req, res) => {
  try {
    const { serviceName, route, targetUrl, method } = req.body;

    if (!serviceName || !route || !targetUrl) {
      return res.status(400).json({ error: 'serviceName, route, and targetUrl are required' });
    }

    const routeId = await apiGatewayService.registerRoute(serviceName, route, targetUrl, method);

    res.status(201).json({ routeId });
  } catch (error) {
    console.error('Error registering route:', error);
    res.status(500).json({ error: 'Failed to register route' });
  }
});

/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: Get all registered routes
 *     description: Retrieves a list of all active service routes
 *     tags: [Routes]
 *     responses:
 *       200:
 *         description: List of routes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       serviceName:
 *                         type: string
 *                       route:
 *                         type: string
 *                       targetUrl:
 *                         type: string
 *                       method:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *       500:
 *         description: Internal server error
 */
router.get('/routes', async (req, res) => {
  try {
    const routes = await apiGatewayService.getRoutes();
    res.json({ routes });
  } catch (error) {
    console.error('Error getting routes:', error);
    res.status(500).json({ error: 'Failed to get routes' });
  }
});

/**
 * @swagger
 * /api/circuit-breakers:
 *   get:
 *     summary: Get circuit breaker status
 *     description: Retrieves the current status of all circuit breakers
 *     tags: [Circuit Breakers]
 *     responses:
 *       200:
 *         description: Circuit breaker status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 circuitBreakers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       serviceName:
 *                         type: string
 *                       state:
 *                         type: string
 *                         enum: [closed, open, half-open]
 *                       failureCount:
 *                         type: integer
 *                       lastFailure:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/circuit-breakers', async (req, res) => {
  try {
    const status = await apiGatewayService.getCircuitBreakerStatus();
    res.json({ circuitBreakers: status });
  } catch (error) {
    console.error('Error getting circuit breaker status:', error);
    res.status(500).json({ error: 'Failed to get circuit breaker status' });
  }
});

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Get audit logs
 *     description: Retrieves audit logs with optional filtering
 *     tags: [Audit]
 *     parameters:
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *         description: Filter by entity ID
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filter by entity type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Maximum number of logs to return
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auditLogs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       action:
 *                         type: string
 *                       entityId:
 *                         type: string
 *                       entityType:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       details:
 *                         type: object
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/audit', async (req, res) => {
  try {
    const { entityId, entityType, limit } = req.query;

    const logs = await apiGatewayService.getAuditLogs(
      entityId as string,
      entityType as string,
      limit ? parseInt(limit as string) : 50
    );

    res.json({ auditLogs: logs });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

// Dynamic route handling - this should be registered last
router.use('*', (req, res, next) => {
  const method = req.method;
  const path = req.path;

  // Try to find a matching route
  const middleware = apiGatewayService.getProxyMiddleware(path, method);

  if (middleware) {
    // Add start time for response time calculation
    (req as any).startTime = Date.now();
    return middleware(req, res, next);
  }

  // No route found
  res.status(404).json({
    error: 'Service Not Found',
    message: `No service configured for ${method} ${path}`
  });
});

export { router as apiGatewayRoutes };