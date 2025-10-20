import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import winston from 'winston';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import CircuitBreaker from 'opossum';

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