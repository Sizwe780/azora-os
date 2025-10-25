/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Azora Nexus API',
    version: '1.0.0',
    description: 'AI Recommendations & Neural Network Hub API',
    contact: {
      name: 'Azora OS',
      email: 'support@azora-os.com'
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3006}`,
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
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          preferences: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Recommendation: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string', enum: ['product', 'content', 'service', 'personalized'] },
          items: { type: 'array', items: { type: 'object' } },
          score: { type: 'number', minimum: 0, maximum: 1 },
          metadata: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      NeuralIntent: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          intent: { type: 'string' },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          context: { type: 'object' },
          processed: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Insight: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          category: { type: 'string' },
          content: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          actionable: { type: 'boolean' },
          metadata: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Analysis: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string', enum: ['behavioral', 'predictive', 'comparative', 'trend'] },
          data: { type: 'object' },
          insights: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
              details: { type: 'object' },
            },
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
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};