import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'domain-marketplace'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
export const customMetrics = {
  httpRequestsTotal: new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
  }),

  domainsListedTotal: new promClient.Counter({
    name: 'domains_listed_total',
    help: 'Total number of domains listed',
    registers: [register]
  }),

  domainsSoldTotal: new promClient.Counter({
    name: 'domains_sold_total',
    help: 'Total number of domains sold',
    registers: [register]
  }),

  bidsPlacedTotal: new promClient.Counter({
    name: 'bids_placed_total',
    help: 'Total number of bids placed',
    registers: [register]
  }),

  searchQueriesTotal: new promClient.Counter({
    name: 'search_queries_total',
    help: 'Total number of search queries',
    registers: [register]
  }),

  activeDomains: new promClient.Gauge({
    name: 'active_domains',
    help: 'Number of currently active domains',
    registers: [register]
  }),

  responseTime: new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register]
  })
};

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;

    customMetrics.httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .inc();

    customMetrics.responseTime
      .labels(req.method, req.route?.path || req.path)
      .observe(duration);
  });

  next();
}

// Metrics endpoint
export function getMetrics() {
  return register.metrics();
}

// Health check with metrics
export function getHealthMetrics() {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  };
}