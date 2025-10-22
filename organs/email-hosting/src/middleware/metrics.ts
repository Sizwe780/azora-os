/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import promClient from 'prometheus-api-metrics';
import { Request, Response, NextFunction } from 'express';

// Initialize Prometheus metrics
const metricsMiddleware = promClient();

// Custom metrics using prom-client directly
import { Counter, Gauge } from 'prom-client';
const register = require('prom-client').register;

// Custom metrics
const customMetrics = {
  emailsSent: new Counter({
    name: 'emails_sent_total',
    help: 'Total number of emails sent',
    labelNames: ['status', 'domain'],
    registers: [register]
  }),

  emailsQueued: new Gauge({
    name: 'emails_queued',
    help: 'Number of emails currently queued',
    registers: [register]
  }),

  domainsActive: new Gauge({
    name: 'domains_active',
    help: 'Number of active domains',
    registers: [register]
  }),

  smtpConnections: new Gauge({
    name: 'smtp_connections_active',
    help: 'Number of active SMTP connections',
    registers: [register]
  }),

  dnsLookups: new Counter({
    name: 'dns_lookups_total',
    help: 'Total number of DNS lookups performed',
    labelNames: ['type', 'result'],
    registers: [register]
  }),

  domainOperations: new Counter({
    name: 'domain_operations_total',
    help: 'Total number of domain operations',
    labelNames: ['operation', 'status'],
    registers: [register]
  })
};

// Export custom metrics for use in other modules
export { customMetrics };

// Export the middleware
export { metricsMiddleware };