/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';
import { createProxyMiddleware } from 'http-proxy-middleware';
import CircuitBreaker from 'opossum';
import axios from 'axios';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const prisma = new PrismaClient();

interface ServiceRoute {
  id: string;
  serviceName: string;
  route: string;
  targetUrl: string;
  method: string;
  isActive: boolean;
}

interface CircuitBreakerState {
  [serviceName: string]: CircuitBreaker;
}

export class ApiGatewayService {
  private routes: Map<string, ServiceRoute> = new Map();
  private circuitBreakers: CircuitBreakerState = {};

  constructor() {}

  setupSwagger(app: any) {
    const swaggerDefinition = {
      openapi: '3.0.0',
      info: {
        title: 'Azora OS API Gateway',
        version: '2.0.0',
        description: 'Enterprise API Gateway with circuit breakers, audit logging, and service routing',
        contact: {
          name: 'Azora OS',
          url: 'https://azora.world'
        },
        license: {
          name: 'SEE LICENSE IN LICENSE',
        }
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          }
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Error message'
              }
            }
          },
          Health: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['healthy', 'unhealthy'],
                description: 'Service health status'
              },
              service: {
                type: 'string',
                description: 'Service name'
              },
              version: {
                type: 'string',
                description: 'Service version'
              },
              database: {
                type: 'string',
                enum: ['connected', 'disconnected'],
                description: 'Database connection status'
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Health check timestamp'
              }
            }
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    };

    const options = {
      swaggerDefinition,
      apis: ['./src/apiGatewayRoutes.ts'], // Path to the API routes
    };

    const swaggerSpec = swaggerJsdoc(options);

    // Serve Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Serve Swagger JSON
    app.get('/swagger.json', (req: any, res: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  async initialize() {
    console.log('Initializing API Gateway Service...');

    // Load routes from database
    await this.loadRoutes();

    // Initialize circuit breakers for known services
    await this.initializeCircuitBreakers();

    console.log(`API Gateway initialized with ${this.routes.size} routes`);
  }

  private async loadRoutes() {
    const routes = await prisma.serviceRoute.findMany({
      where: { isActive: true }
    });

    for (const route of routes) {
      this.routes.set(`${route.method}:${route.route}`, route);
    }

    console.log(`Loaded ${routes.length} active routes`);
  }

  private async initializeCircuitBreakers() {
    const services = await prisma.circuitBreaker.findMany();

    for (const service of services) {
      this.circuitBreakers[service.serviceName] = new CircuitBreaker(
        async (url: string, options: any) => {
          return axios(options);
        },
        {
          timeout: service.timeout,
          errorThresholdPercentage: 50,
          resetTimeout: 30000
        }
      );

      // Set initial state
      if (service.state === 'open') {
        this.circuitBreakers[service.serviceName].open();
      }
    }
  }

  async registerRoute(serviceName: string, route: string, targetUrl: string, method: string = 'GET') {
    try {
      const serviceRoute = await prisma.serviceRoute.create({
        data: {
          serviceName,
          route,
          targetUrl,
          method
        }
      });

      this.routes.set(`${method}:${route}`, serviceRoute);

      // Initialize circuit breaker for new service if not exists
      if (!this.circuitBreakers[serviceName]) {
        await this.createCircuitBreaker(serviceName);
      }

      await this.logAudit('route_registered', serviceRoute.id, 'ServiceRoute', {
        serviceName,
        route,
        targetUrl,
        method
      });

      return serviceRoute.id;
    } catch (error) {
      console.error('Error registering route:', error);
      throw error;
    }
  }

  private async createCircuitBreaker(serviceName: string) {
    const circuitBreaker = await prisma.circuitBreaker.upsert({
      where: { serviceName },
      update: {},
      create: { serviceName }
    });

    this.circuitBreakers[serviceName] = new CircuitBreaker(
      async (url: string, options: any) => axios(options),
      {
        timeout: circuitBreaker.timeout,
        errorThresholdPercentage: 50,
        resetTimeout: 30000
      }
    );
  }

  getProxyMiddleware(route: string, method: string) {
    const routeKey = `${method}:${route}`;
    const serviceRoute = this.routes.get(routeKey);

    if (!serviceRoute) {
      return null;
    }

    const circuitBreaker = this.circuitBreakers[serviceRoute.serviceName];

    return createProxyMiddleware({
      target: serviceRoute.targetUrl,
      changeOrigin: true,
      pathRewrite: {
        [`^${route}`]: ''
      },
      onProxyReq: (proxyReq: any, req: any) => {
        // Add custom headers
        proxyReq.setHeader('X-Gateway-Service', serviceRoute.serviceName);
        proxyReq.setHeader('X-Gateway-Route', route);
      },
      onProxyRes: (proxyRes: any, req: any, res: any) => {
        // Log the API call
        this.logApiCall(req, res, serviceRoute.id);
      },
      onError: (err: any, req: any, res: any) => {
        console.error(`Proxy error for ${route}:`, err);
        this.handleCircuitBreakerError(serviceRoute.serviceName, err);
        res.status(502).json({ error: 'Service temporarily unavailable' });
      }
    } as any);
  }

  private async logApiCall(req: any, res: any, routeId: string) {
    try {
      await prisma.apiCall.create({
        data: {
          routeId,
          method: req.method,
          path: req.path,
          userId: req.user?.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          statusCode: res.statusCode,
          responseTime: Date.now() - req.startTime,
          requestSize: req.get('content-length') ? parseInt(req.get('content-length')) : undefined,
          responseSize: res.get('content-length') ? parseInt(res.get('content-length')) : undefined
        }
      });
    } catch (error) {
      console.error('Error logging API call:', error);
    }
  }

  private async handleCircuitBreakerError(serviceName: string, error: any) {
    try {
      await prisma.circuitBreaker.update({
        where: { serviceName },
        data: {
          failureCount: { increment: 1 },
          lastFailure: new Date()
        }
      });

      await this.logAudit('circuit_breaker_failure', serviceName, 'CircuitBreaker', {
        error: error.message
      });
    } catch (dbError) {
      console.error('Error updating circuit breaker:', dbError);
    }
  }

  async getRoutes() {
    return Array.from(this.routes.values());
  }

  async getCircuitBreakerStatus() {
    const statuses: any = {};
    for (const [serviceName, breaker] of Object.entries(this.circuitBreakers)) {
      statuses[serviceName] = {
        state: breaker.opened ? 'open' : 'closed',
        failures: breaker.stats.failures,
        successes: breaker.stats.successes
      };
    }
    return statuses;
  }

  private async logAudit(action: string, entityId: string, entityType: string, details: any) {
    await prisma.auditLog.create({
      data: {
        action,
        entityId,
        entityType,
        details
      }
    });
  }

  async getAuditLogs(entityId?: string, entityType?: string, limit: number = 50) {
    const where: any = {};
    if (entityId) where.entityId = entityId;
    if (entityType) where.entityType = entityType;

    return await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }
}

export const apiGatewayService = new ApiGatewayService();