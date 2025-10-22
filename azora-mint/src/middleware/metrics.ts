/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

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

  creditApplicationsTotal: new promClient.Counter({
    name: 'credit_applications_total',
    help: 'Total number of credit applications',
    registers: [register],
  }),

  creditApprovalsTotal: new promClient.Counter({
    name: 'credit_approvals_total',
    help: 'Total number of approved credit applications',
    registers: [register],
  }),

  creditRepaymentsTotal: new promClient.Counter({
    name: 'credit_repayments_total',
    help: 'Total number of credit repayments',
    registers: [register],
  }),

  trustScoresCalculated: new promClient.Counter({
    name: 'trust_scores_calculated_total',
    help: 'Total number of trust scores calculated',
    registers: [register],
  }),

  activeLoans: new promClient.Gauge({
    name: 'active_loans',
    help: 'Number of currently active loans',
    registers: [register],
  }),

  totalLoanValue: new promClient.Gauge({
    name: 'total_loan_value_azr',
    help: 'Total value of active loans in AZR',
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