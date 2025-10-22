/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Azora OS Email Hosting Service API',
    version: '1.0.0',
    description: 'Comprehensive email hosting service with domain management, SMTP configuration, and email routing capabilities',
    contact: {
      name: 'Azora OS Team',
      email: 'support@azora-os.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3006',
      description: 'Development server'
    },
    {
      url: 'https://api.azora-os.com/email-hosting',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key'
      }
    },
    schemas: {
      Domain: {
        type: 'object',
        required: ['name', 'owner'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique domain identifier'
          },
          name: {
            type: 'string',
            description: 'Domain name (e.g., example.com)'
          },
          owner: {
            type: 'string',
            description: 'Owner user ID'
          },
          status: {
            type: 'string',
            enum: ['pending', 'active', 'suspended', 'expired'],
            description: 'Domain status'
          },
          dnsRecords: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/DNSRecord'
            }
          },
          smtpConfig: {
            $ref: '#/components/schemas/SMTPConfig'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      DNSRecord: {
        type: 'object',
        required: ['type', 'name', 'value'],
        properties: {
          type: {
            type: 'string',
            enum: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'PTR'],
            description: 'DNS record type'
          },
          name: {
            type: 'string',
            description: 'Record name'
          },
          value: {
            type: 'string',
            description: 'Record value'
          },
          ttl: {
            type: 'integer',
            minimum: 60,
            maximum: 86400,
            default: 3600,
            description: 'Time to live in seconds'
          },
          priority: {
            type: 'integer',
            description: 'Priority for MX records'
          }
        }
      },
      SMTPConfig: {
        type: 'object',
        properties: {
          host: {
            type: 'string',
            description: 'SMTP server hostname'
          },
          port: {
            type: 'integer',
            minimum: 1,
            maximum: 65535,
            default: 587,
            description: 'SMTP server port'
          },
          secure: {
            type: 'boolean',
            default: false,
            description: 'Use TLS encryption'
          },
          username: {
            type: 'string',
            description: 'SMTP authentication username'
          },
          password: {
            type: 'string',
            description: 'SMTP authentication password'
          },
          dkim: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              selector: { type: 'string' },
              privateKey: { type: 'string' }
            }
          },
          spf: {
            type: 'string',
            description: 'SPF record value'
          },
          dmarc: {
            type: 'string',
            description: 'DMARC record value'
          }
        }
      },
      Email: {
        type: 'object',
        required: ['from', 'to', 'subject'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique email identifier'
          },
          from: {
            type: 'string',
            format: 'email',
            description: 'Sender email address'
          },
          to: {
            type: 'array',
            items: { type: 'string', format: 'email' },
            description: 'Recipient email addresses'
          },
          cc: {
            type: 'array',
            items: { type: 'string', format: 'email' },
            description: 'CC recipient email addresses'
          },
          bcc: {
            type: 'array',
            items: { type: 'string', format: 'email' },
            description: 'BCC recipient email addresses'
          },
          subject: {
            type: 'string',
            description: 'Email subject'
          },
          text: {
            type: 'string',
            description: 'Plain text email body'
          },
          html: {
            type: 'string',
            description: 'HTML email body'
          },
          attachments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                filename: { type: 'string' },
                content: { type: 'string' },
                contentType: { type: 'string' }
              }
            }
          },
          status: {
            type: 'string',
            enum: ['queued', 'sending', 'sent', 'delivered', 'bounced', 'failed'],
            description: 'Email delivery status'
          },
          priority: {
            type: 'string',
            enum: ['low', 'normal', 'high'],
            default: 'normal'
          },
          scheduledAt: {
            type: 'string',
            format: 'date-time',
            description: 'Scheduled send time'
          },
          sentAt: {
            type: 'string',
            format: 'date-time',
            description: 'Actual send time'
          },
          deliveredAt: {
            type: 'string',
            format: 'date-time',
            description: 'Delivery confirmation time'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            description: 'Error message'
          },
          error: {
            type: 'string',
            description: 'Error type/code'
          },
          details: {
            type: 'object',
            description: 'Additional error details'
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    },
    {
      apiKeyAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/models/*.ts']
};

export const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: any): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}