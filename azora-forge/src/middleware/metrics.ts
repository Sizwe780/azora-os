import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';

const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
export const customMetrics = {
  httpRequestsTotal: new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
  }),

  httpRequestDuration: new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register],
  }),

  listingsCreatedTotal: new promClient.Counter({
    name: 'listings_created_total',
    help: 'Total number of marketplace listings created',
    registers: [register],
  }),

  transactionsTotal: new promClient.Counter({
    name: 'marketplace_transactions_total',
    help: 'Total number of marketplace transactions',
    registers: [register],
  }),
};

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;

    customMetrics.httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .inc();

    customMetrics.httpRequestDuration
      .labels(req.method, req.route?.path || req.path)
      .observe(duration);
  });

  next();
};

// Metrics endpoint handler
export const getMetrics = async (): Promise<string> => {
  return register.metrics();
};