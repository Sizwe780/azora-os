import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Domain Marketplace API',
      version: '1.0.0',
      description: 'API for domain registration and marketplace operations',
    },
    servers: [
      {
        url: 'http://localhost:3007',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        DomainListing: {
          type: 'object',
          properties: {
            domain: {
              type: 'string',
              description: 'Domain name',
              example: 'example.com',
            },
            owner: {
              type: 'string',
              description: 'Owner user ID',
              example: 'user123',
            },
            status: {
              type: 'string',
              enum: ['available', 'listed', 'sold', 'transferred'],
              description: 'Domain status',
            },
            price: {
              type: 'number',
              description: 'Listing price',
              example: 99.99,
            },
            category: {
              type: 'string',
              description: 'Domain category',
              example: 'technology',
            },
            description: {
              type: 'string',
              description: 'Domain description',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Domain tags',
            },
          },
        },
        DomainBid: {
          type: 'object',
          properties: {
            domain: {
              type: 'string',
              description: 'Domain name',
              example: 'example.com',
            },
            bidder: {
              type: 'string',
              description: 'Bidder user ID',
              example: 'user456',
            },
            amount: {
              type: 'number',
              description: 'Bid amount',
              example: 150.00,
            },
            status: {
              type: 'string',
              enum: ['active', 'accepted', 'rejected', 'expired'],
              description: 'Bid status',
            },
          },
        },
        DomainWatchlist: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID',
              example: 'user123',
            },
            domain: {
              type: 'string',
              description: 'Domain name',
              example: 'example.com',
            },
            alertPrice: {
              type: 'number',
              description: 'Price alert threshold',
              example: 100.00,
            },
          },
        },
        DomainCategory: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Category name',
              example: 'Technology',
            },
            slug: {
              type: 'string',
              description: 'Category slug',
              example: 'technology',
            },
            description: {
              type: 'string',
              description: 'Category description',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error message',
                },
                statusCode: {
                  type: 'number',
                  example: 400,
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };