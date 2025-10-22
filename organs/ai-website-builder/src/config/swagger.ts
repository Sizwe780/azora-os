/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Website Builder API',
      version: '1.0.0',
      description: 'API for AI-powered website generation, customization, and deployment',
    },
    servers: [
      {
        url: 'http://localhost:3008',
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
        WebsiteGeneration: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Website name',
              example: 'My Awesome Business',
            },
            description: {
              type: 'string',
              description: 'Website description',
              example: 'A modern business website for showcasing services',
            },
            businessType: {
              type: 'string',
              enum: ['ecommerce', 'blog', 'portfolio', 'business', 'restaurant', 'agency', 'other'],
              description: 'Type of business',
            },
            targetAudience: {
              type: 'string',
              description: 'Target audience description',
              example: 'Small business owners and entrepreneurs',
            },
            colorScheme: {
              type: 'array',
              items: { type: 'string' },
              description: 'Color scheme (hex colors)',
              example: ['#007bff', '#28a745', '#dc3545'],
            },
            features: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['contact-form', 'gallery', 'blog', 'ecommerce', 'social-links', 'newsletter', 'analytics'],
              },
              description: 'Website features',
            },
            templateId: {
              type: 'string',
              description: 'Template ID to use',
            },
          },
        },
        WebsiteTemplate: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Template name',
            },
            description: {
              type: 'string',
              description: 'Template description',
            },
            category: {
              type: 'string',
              enum: ['minimal', 'modern', 'creative', 'corporate', 'ecommerce'],
              description: 'Template category',
            },
            businessType: {
              type: 'array',
              items: { type: 'string' },
              description: 'Compatible business types',
            },
            thumbnail: {
              type: 'string',
              description: 'Thumbnail image URL',
            },
            previewUrl: {
              type: 'string',
              description: 'Preview URL',
            },
            customizableSections: {
              type: 'array',
              items: { type: 'string' },
              description: 'Customizable sections',
            },
            features: {
              type: 'array',
              items: { type: 'string' },
              description: 'Template features',
            },
          },
        },
        WebsiteDeployment: {
          type: 'object',
          properties: {
            websiteId: {
              type: 'string',
              description: 'Website ID to deploy',
            },
            subdomain: {
              type: 'string',
              description: 'Subdomain for deployment',
              example: 'mybusiness',
            },
            domain: {
              type: 'string',
              description: 'Custom domain (optional)',
              example: 'mybusiness.com',
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