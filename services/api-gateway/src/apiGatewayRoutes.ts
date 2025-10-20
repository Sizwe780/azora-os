import express from 'express';
import { apiGatewayService } from './apiGatewayService';

const router = express.Router();

// Register a new service route
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

// Get all registered routes
router.get('/routes', async (req, res) => {
  try {
    const routes = await apiGatewayService.getRoutes();
    res.json({ routes });
  } catch (error) {
    console.error('Error getting routes:', error);
    res.status(500).json({ error: 'Failed to get routes' });
  }
});

// Get circuit breaker status
router.get('/circuit-breakers', async (req, res) => {
  try {
    const status = await apiGatewayService.getCircuitBreakerStatus();
    res.json({ circuitBreakers: status });
  } catch (error) {
    console.error('Error getting circuit breaker status:', error);
    res.status(500).json({ error: 'Failed to get circuit breaker status' });
  }
});

// Get audit logs
router.get('/audit', async (req, res) => {
  try {
    const { entityId, entityType, limit } = req.query;

    const logs = await apiGatewayService.getAuditLogs(
      entityId as string,
      entityType as string,
      limit ? parseInt(limit as string) : 50
    );

    res.json({ logs });
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