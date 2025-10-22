/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import winston from 'winston';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import CircuitBreaker from 'opossum';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export class EmailService {
  private app: express.Application;
  private prisma: PrismaClient;
  private logger: winston.Logger;
  private transporter: nodemailer.Transporter;
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    this.logger = this.setupLogger();
    this.transporter = this.setupTransporter();
    this.circuitBreaker = this.setupCircuitBreaker();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSwagger(this.app);
  }

  private setupLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });
  }

  private setupTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  private setupCircuitBreaker(): CircuitBreaker {
    return new CircuitBreaker(async (emailData: any) => {
      return await this.transporter.sendMail(emailData);
    }, {
      timeout: 10000, // 10 seconds
      errorThresholdPercentage: 50,
      resetTimeout: 30000 // 30 seconds
    });
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Health check
    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health check endpoint
     *     description: Returns the health status of the email service and database connection
     *     tags: [Health]
     *     responses:
     *       200:
     *         description: Service is healthy
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: healthy
     *                 service:
     *                   type: string
     *                   example: email-service
     *                 version:
     *                   type: string
     *                   example: 2.0.0
     *                 database:
     *                   type: string
     *                   example: connected
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *       503:
     *         description: Service is unhealthy
     */
    this.app.get('/health', async (req, res) => {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        res.json({
          status: 'healthy',
          service: 'email-service',
          version: '2.0.0',
          database: 'connected',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Health check failed:', error);
        res.status(503).json({
          status: 'unhealthy',
          service: 'email-service',
          error: 'Database connection failed'
        });
      }
    });

    // Send email endpoint
    /**
     * @swagger
     * /api/email/send:
     *   post:
     *     summary: Send an email
     *     description: Queues an email for sending. Supports both plain text and HTML content, with optional template processing.
     *     tags: [Email]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - to
     *               - subject
     *             properties:
     *               to:
     *                 type: string
     *                 format: email
     *                 description: Recipient email address
     *               subject:
     *                 type: string
     *                 description: Email subject line
     *               text:
     *                 type: string
     *                 description: Plain text content (ignored if html is provided)
     *               html:
     *                 type: string
     *                 description: HTML content for the email
     *               templateId:
     *                 type: string
     *                 description: ID of email template to use (optional)
     *               variables:
     *                 type: object
     *                 description: Template variables for substitution (required if templateId is provided)
     *               priority:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 10
     *                 default: 1
     *                 description: Email priority (higher numbers processed first)
     *               userId:
     *                 type: string
     *                 description: User ID for audit logging
     *     responses:
     *       200:
     *         description: Email queued successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 emailId:
     *                   type: string
     *                   description: Unique identifier for the queued email
     *                 message:
     *                   type: string
     *                   example: Email queued for sending
     *       400:
     *         description: Missing required fields or invalid template
     *       404:
     *         description: Template not found
     *       500:
     *         description: Internal server error
     */
    this.app.post('/api/email/send', async (req, res) => {
      try {
        const { to, subject, text, html, templateId, variables } = req.body;

        if (!to || !subject) {
          return res.status(400).json({ error: 'Missing required fields: to, subject' });
        }

        let content = text || html;
        let finalSubject = subject;

        // If template is specified, load and process it
        if (templateId) {
          const template = await this.prisma.emailTemplate.findUnique({
            where: { id: templateId }
          });

          if (!template) {
            return res.status(404).json({ error: 'Email template not found' });
          }

          finalSubject = this.processTemplate(template.subject, variables || {});
          content = this.processTemplate(template.htmlContent, variables || {});
        }

        // Queue the email for sending
        const queuedEmail = await this.prisma.emailQueue.create({
          data: {
            to,
            subject: finalSubject,
            content: content || '',
            priority: req.body.priority || 1
          }
        });

        // Log the action
        await this.logAudit('email_queued', queuedEmail.id, 'EmailQueue', req.body.userId, {
          to, subject: finalSubject, templateId
        });

        res.json({
          success: true,
          emailId: queuedEmail.id,
          message: 'Email queued for sending'
        });

      } catch (error) {
        this.logger.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to queue email' });
      }
    });

    // Get email templates
    /**
     * @swagger
     * /api/email/templates:
     *   get:
     *     summary: Get all email templates
     *     description: Retrieves a list of all available email templates with basic information
     *     tags: [Templates]
     *     responses:
     *       200:
     *         description: List of email templates retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     description: Template unique identifier
     *                   name:
     *                     type: string
     *                     description: Template name
     *                   subject:
     *                     type: string
     *                     description: Template subject line
     *                   createdAt:
     *                     type: string
     *                     format: date-time
     *                     description: Template creation timestamp
     *       500:
     *         description: Internal server error
     */
    this.app.get('/api/email/templates', async (req, res) => {
      try {
        const templates = await this.prisma.emailTemplate.findMany({
          select: { id: true, name: true, subject: true, createdAt: true }
        });
        res.json(templates);
      } catch (error) {
        this.logger.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
      }
    });

    // Create email template
    /**
     * @swagger
     * /api/email/templates:
     *   post:
     *     summary: Create a new email template
     *     description: Creates a new email template with subject, HTML content, and optional text content
     *     tags: [Templates]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - subject
     *               - htmlContent
     *             properties:
     *               name:
     *                 type: string
     *                 description: Template name
     *               subject:
     *                 type: string
     *                 description: Email subject template with optional variables (e.g., "Welcome {{userName}}")
     *               htmlContent:
     *                 type: string
     *                 description: HTML content template with variables for substitution
     *               textContent:
     *                 type: string
     *                 description: Plain text content template (optional)
     *               variables:
     *                 type: object
     *                 description: Schema definition for template variables
     *                 example: {"userName": "string", "companyName": "string"}
     *               userId:
     *                 type: string
     *                 description: User ID for audit logging
     *     responses:
     *       200:
     *         description: Template created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/EmailTemplate'
     *       500:
     *         description: Internal server error
     */
    this.app.post('/api/email/templates', async (req, res) => {
      try {
        const { name, subject, htmlContent, textContent, variables } = req.body;

        const template = await this.prisma.emailTemplate.create({
          data: {
            name,
            subject,
            htmlContent,
            textContent,
            variables: variables || {}
          }
        });

        await this.logAudit('template_created', template.id, 'EmailTemplate', req.body.userId, {
          name, subject
        });

        res.json(template);
      } catch (error) {
        this.logger.error('Error creating template:', error);
        res.status(500).json({ error: 'Failed to create template' });
      }
    });

    // Process email queue (internal endpoint)
    /**
     * @swagger
     * /api/email/process-queue:
     *   post:
     *     summary: Process email queue
     *     description: Processes pending emails in the queue, sending them via SMTP with circuit breaker protection
     *     tags: [Queue]
     *     responses:
     *       200:
     *         description: Queue processing completed
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 processed:
     *                   type: integer
     *                   description: Number of emails processed
     *                 results:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         description: Email queue item ID
     *                       status:
     *                         type: string
     *                         enum: [sent, failed]
     *                       error:
     *                         type: string
     *                         description: Error message (only present for failed emails)
     *       500:
     *         description: Internal server error
     */
    this.app.post('/api/email/process-queue', async (req, res) => {
      try {
        const pendingEmails = await this.prisma.emailQueue.findMany({
          where: { status: 'pending' },
          orderBy: { priority: 'desc' },
          take: 10
        });

        const results = [];
        for (const email of pendingEmails) {
          try {
            await this.prisma.emailQueue.update({
              where: { id: email.id },
              data: { status: 'processing' }
            });

            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email.to,
              subject: email.subject,
              text: email.content
            };

            await this.circuitBreaker.fire(mailOptions);

            await this.prisma.emailQueue.update({
              where: { id: email.id },
              data: { status: 'sent' }
            });

            // Log the sent email
            await this.prisma.emailLog.create({
              data: {
                to: email.to,
                from: process.env.EMAIL_USER!,
                subject: email.subject,
                status: 'sent',
                sentAt: new Date()
              }
            });

            await this.logAudit('email_sent', email.id, 'EmailQueue', null, {
              to: email.to, subject: email.subject
            });

            results.push({ id: email.id, status: 'sent' });

          } catch (error) {
            this.logger.error(`Failed to send email ${email.id}:`, error);

            const retryCount = email.retryCount + 1;
            const shouldRetry = retryCount < email.maxRetries;

            await this.prisma.emailQueue.update({
              where: { id: email.id },
              data: {
                status: shouldRetry ? 'pending' : 'failed',
                retryCount,
                nextRetry: shouldRetry ? new Date(Date.now() + 60000 * retryCount) : null
              }
            });

            // Log the failed email
            await this.prisma.emailLog.create({
              data: {
                to: email.to,
                from: process.env.EMAIL_USER!,
                subject: email.subject,
                status: 'failed',
                error: (error as Error).message
              }
            });

            results.push({ id: email.id, status: 'failed', error: (error as Error).message });
          }
        }

        res.json({ processed: results.length, results });

      } catch (error) {
        this.logger.error('Error processing queue:', error);
        res.status(500).json({ error: 'Failed to process queue' });
      }
    });
  }

  private setupSwagger(app: express.Application): void {
    const swaggerDefinition = {
      openapi: '3.0.0',
      info: {
        title: 'Azora OS Email Service',
        version: '2.0.0',
        description: 'Enterprise email service with templates, queuing, SMTP integration, and audit logging',
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
        schemas: {
          EmailTemplate: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for the template'
              },
              name: {
                type: 'string',
                description: 'Template name'
              },
              subject: {
                type: 'string',
                description: 'Email subject template'
              },
              htmlContent: {
                type: 'string',
                description: 'HTML content template'
              },
              textContent: {
                type: 'string',
                description: 'Plain text content template'
              },
              variables: {
                type: 'object',
                description: 'Template variables schema'
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Creation timestamp'
              }
            }
          },
          EmailQueue: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for the queued email'
              },
              to: {
                type: 'string',
                format: 'email',
                description: 'Recipient email address'
              },
              subject: {
                type: 'string',
                description: 'Email subject'
              },
              content: {
                type: 'string',
                description: 'Email content'
              },
              priority: {
                type: 'integer',
                minimum: 1,
                maximum: 10,
                description: 'Email priority (1-10, higher is more important)'
              },
              status: {
                type: 'string',
                enum: ['pending', 'processing', 'sent', 'failed'],
                description: 'Email sending status'
              }
            }
          },
          EmailLog: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for the email log'
              },
              to: {
                type: 'string',
                format: 'email',
                description: 'Recipient email address'
              },
              from: {
                type: 'string',
                format: 'email',
                description: 'Sender email address'
              },
              subject: {
                type: 'string',
                description: 'Email subject'
              },
              status: {
                type: 'string',
                enum: ['sent', 'failed', 'bounced'],
                description: 'Email delivery status'
              },
              sentAt: {
                type: 'string',
                format: 'date-time',
                description: 'Timestamp when email was sent'
              },
              error: {
                type: 'string',
                description: 'Error message if delivery failed'
              }
            }
          }
        }
      }
    };

    const options = {
      swaggerDefinition,
      apis: ['./src/emailService.ts'] // Path to the API docs
    };

    const specs = swaggerJsdoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  public async getTemplate(id: string) {
    return await this.prisma.emailTemplate.findUnique({
      where: { id }
    });
  }

  public processTemplate(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return result;
  }

  public async queueEmail(to: string, subject: string, content: string, priority: number = 1) {
    const queuedEmail = await this.prisma.emailQueue.create({
      data: {
        to,
        subject,
        content,
        priority
      }
    });

    await this.logAudit('email_queued', queuedEmail.id, 'EmailQueue', null, {
      to, subject
    });

    return queuedEmail.id;
  }

  public async getTemplates() {
    return await this.prisma.emailTemplate.findMany({
      select: { id: true, name: true, subject: true, createdAt: true }
    });
  }

  public async createTemplate(data: any) {
    const { name, subject, htmlContent, textContent, variables, userId } = data;

    const template = await this.prisma.emailTemplate.create({
      data: {
        name,
        subject,
        htmlContent,
        textContent,
        variables: variables || {}
      }
    });

    await this.logAudit('template_created', template.id, 'EmailTemplate', userId, {
      name, subject
    });

    return template;
  }

  private async logAudit(
    action: string,
    entityId: string,
    entityType: string,
    userId: string | null,
    details: any
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          entityId,
          entityType,
          userId,
          details
        }
      });
    } catch (error) {
      this.logger.error('Failed to log audit:', error);
    }
  }

  public start(port: number = 3000): void {
    this.app.listen(port, () => {
      this.logger.info(`Email service running on port ${port}`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}