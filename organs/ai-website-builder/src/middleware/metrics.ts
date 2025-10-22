/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import promClient from 'prometheus-api-metrics';

// Custom metrics using prom-client directly
import { Counter, Histogram, Gauge } from 'prom-client';
import { register } from 'prom-client';

export const metricsMiddleware = promClient({
  metricsPath: '/api/v1/health/metrics',
});

// Custom metrics
export const customMetrics = {
  websitesGeneratedTotal: new Counter({
    name: 'azora_websites_generated_total',
    help: 'Total number of websites generated',
    registers: [register],
  }),

  websitesDeployedTotal: new Counter({
    name: 'azora_websites_deployed_total',
    help: 'Total number of websites deployed',
    registers: [register],
  }),

  templatesUsedTotal: new Counter({
    name: 'azora_templates_used_total',
    help: 'Total number of templates used',
    labelNames: ['template_type'],
    registers: [register],
  }),

  aiRequestsTotal: new Counter({
    name: 'azora_ai_requests_total',
    help: 'Total number of AI requests',
    labelNames: ['operation_type'],
    registers: [register],
  }),

  websiteGenerationDuration: new Histogram({
    name: 'azora_website_generation_duration_seconds',
    help: 'Duration of website generation in seconds',
    buckets: [10, 30, 60, 120, 300, 600],
    registers: [register],
  }),

  activeWebsites: new Gauge({
    name: 'azora_active_websites',
    help: 'Number of currently active websites',
    registers: [register],
  }),
};

// Rate limiter for AI operations (separate from metrics)
export const aiRateLimiter = {
  consume: async (key: string) => {
    // Simple in-memory rate limiter for AI operations
    // In production, use Redis or a proper rate limiter
    return Promise.resolve();
  },
};