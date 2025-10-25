/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { register } from 'prom-client';
import { logger } from './logger';

export const startMetricsServer = (): void => {
  const metricsApp = express();
  const metricsPort = process.env.METRICS_PORT || 9091;

  metricsApp.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      const metrics = await register.metrics();
      res.end(metrics);
    } catch (error) {
      logger.error('Error generating metrics:', error);
      res.status(500).end();
    }
  });

  metricsApp.listen(metricsPort, () => {
    logger.info(`Metrics server running on port ${metricsPort}`);
    logger.info(`Metrics available at http://localhost:${metricsPort}/metrics`);
  });
};