/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Request, Response, NextFunction } from 'express';
import { register, collectDefaultMetrics, Histogram } from 'prom-client';

// Enable default metrics collection
collectDefaultMetrics();

// Create custom metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const httpRequestsTotal = new Histogram({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const route = req.route?.path || req.path;
    const statusCode = res.statusCode.toString();

    // Record metrics
    httpRequestDuration
      .labels(req.method, route, statusCode)
      .observe(duration);

    httpRequestsTotal
      .labels(req.method, route, statusCode)
      .observe(1);
  });

  next();
};

// Export metrics registry for the metrics server
export { register };