import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/database';
import domainRoutes from './routes/domainRoutes';
import marketplaceRoutes from './routes/marketplaceRoutes';
import categoryRoutes from './routes/categoryRoutes';
import healthRoutes from './routes/healthRoutes';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { domainRateLimiter } from './middleware/rateLimiter';
import { metricsMiddleware } from './middleware/metrics';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3007;

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Azora OS Domain Marketplace API',
    version: '2.0.0',
    description: 'Domain registration, marketplace, and management service',
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
      url: `http://localhost:${PORT}`,
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
      },
      DomainListing: {
        type: 'object',
        properties: {
          domain: {
            type: 'string',
            description: 'Domain name'
          },
          owner: {
            type: 'string',
            description: 'Domain owner ID'
          },
          status: {
            type: 'string',
            enum: ['available', 'listed', 'sold', 'transferred', 'expired']
          },
          price: {
            type: 'number',
            description: 'Domain price'
          },
          currency: {
            type: 'string',
            default: 'USD'
          },
          category: {
            type: 'string',
            description: 'Domain category'
          },
          description: {
            type: 'string',
            description: 'Domain description'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          featured: {
            type: 'boolean',
            default: false
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
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(requestLogger);

// Rate limiting
app.use(domainRateLimiter);

// Metrics
app.use(metricsMiddleware);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/v1/domains', domainRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/health', healthRoutes);

// Error handling
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully', { service: 'domain-marketplace' });
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully', { service: 'domain-marketplace' });
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`Domain Marketplace Service running on port ${PORT}`, {
        service: 'domain-marketplace',
        port: PORT
      });
    });
  } catch (error) {
    logger.error('Failed to start Domain Marketplace Service:', error);
    process.exit(1);
  }
}

startServer();

export default app;