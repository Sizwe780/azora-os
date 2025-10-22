/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Express middleware to automatically capture traces
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const TRACING_SERVICE_URL = process.env.TRACING_SERVICE_URL || 'http://localhost:4998';

function createTraceMiddleware(serviceName) {
  return async (req, res, next) => {
    const startTime = Date.now();
    const traceId = req.headers['x-trace-id'] || uuidv4();
    const parentSpanId = req.headers['x-span-id'] || null;

    // Attach trace info to request
    req.traceId = traceId;
    req.spanId = uuidv4();
    req.serviceName = serviceName;

    // Override res.json to capture response
    const originalJson = res.json.bind(res);
    res.json = function(body) {
      const duration = Date.now() - startTime;

      // Send trace asynchronously (don't block response)
      setImmediate(async () => {
        try {
          await axios.post(`${TRACING_SERVICE_URL}/api/trace`, {
            traceId,
            parentSpanId,
            serviceName,
            operation: `${req.method} ${req.path}`,
            timestamp: new Date().toISOString(),
            duration,
            statusCode: res.statusCode,
            request: {
              method: req.method,
              path: req.path,
              query: req.query,
              body: req.body,
              headers: req.headers,
            },
            response: {
              statusCode: res.statusCode,
              body: body,
            },
            metadata: {
              ip: req.ip,
              userAgent: req.headers['user-agent'],
            },
            neighbors: req.neighbors || [],
          });
        } catch (error) {
          console.error('Failed to send trace:', error.message);
        }
      });

      return originalJson(body);
    };

    next();
  };
}

// Helper to track neighbor calls
function trackNeighborCall(req, neighborService) {
  if (!req.neighbors) req.neighbors = [];
  if (!req.neighbors.includes(neighborService)) {
    req.neighbors.push(neighborService);
  }
}

module.exports = { createTraceMiddleware, trackNeighborCall };
