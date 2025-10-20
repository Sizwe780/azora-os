import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import winston from 'winston';
import { PrismaClient } from '@prisma/client';
import CircuitBreaker from 'opossum';

export class MessagingService {
  private app: express.Application;
  private prisma: PrismaClient;
  private logger: winston.Logger;
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    this.logger = this.setupLogger();
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

  private setupCircuitBreaker(): CircuitBreaker {
    return new CircuitBreaker(async (operation: any) => {
      return await operation();
    }, {
      timeout: 10000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000
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
          service: 'messaging-service',
          version: '2.0.0',
          database: 'connected',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Health check failed:', error);
        res.status(503).json({
          status: 'unhealthy',
          service: 'messaging-service',
          error: 'Database connection failed'
        });
      }
    });

    // Send message
    this.app.post('/api/messages', async (req, res) => {
      try {
        const { from, to, text, conversationId, messageType, metadata } = req.body;

        if (!from || !text) {
          return res.status(400).json({ error: 'Missing required fields: from, text' });
        }

        let conversation = conversationId ?
          await this.prisma.conversation.findUnique({ where: { id: conversationId } }) :
          null;

        // Create conversation if it doesn't exist
        if (!conversation) {
          if (!to) {
            return res.status(400).json({ error: 'Missing recipient or conversationId' });
          }

          conversation = await this.prisma.conversation.create({
            data: {
              participants: [from, to].sort(),
              type: 'direct'
            }
          });
        }

        // Create message
        const message = await this.prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: from,
            content: text,
            messageType: messageType || 'text',
            metadata: metadata || {}
          }
        });

        // Update conversation timestamp
        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() }
        });

        // Log the action
        await this.logAudit('message_sent', message.id, 'Message', from, {
          conversationId: conversation.id,
          messageType: message.messageType
        });

        res.json({
          success: true,
          messageId: message.id,
          conversationId: conversation.id
        });

      } catch (error) {
        this.logger.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
      }
    });

    // Get messages for user
    this.app.get('/api/messages/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        // Get all conversations for the user
        const conversations = await this.prisma.conversation.findMany({
          where: {
            participants: {
              has: userId
            }
          },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: parseInt(limit as string),
              skip: parseInt(offset as string),
              include: {
                conversation: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });

        res.json({ conversations });

      } catch (error) {
        this.logger.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
      }
    });

    // Get conversation messages
    this.app.get('/api/conversations/:conversationId/messages', async (req, res) => {
      try {
        const { conversationId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const messages = await this.prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit as string),
          skip: parseInt(offset as string)
        });

        res.json({ messages });

      } catch (error) {
        this.logger.error('Error fetching conversation messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
      }
    });

    // Mark message as read
    this.app.post('/api/messages/:messageId/read', async (req, res) => {
      try {
        const { messageId } = req.params;
        const { userId } = req.body;

        if (!userId) {
          return res.status(400).json({ error: 'Missing userId' });
        }

        // Update message read status
        const message = await this.prisma.message.findUnique({
          where: { id: messageId }
        });

        if (!message) {
          return res.status(404).json({ error: 'Message not found' });
        }

        const readBy = [...(message.readBy || [])];
        if (!readBy.includes(userId)) {
          readBy.push(userId);
        }

        await this.prisma.message.update({
          where: { id: messageId },
          data: { readBy }
        });

        // Create or update message status
        await this.prisma.messageStatus.upsert({
          where: {
            messageId_userId: {
              messageId,
              userId
            }
          },
          update: {
            status: 'read',
            timestamp: new Date()
          },
          create: {
            messageId,
            userId,
            status: 'read'
          }
        });

        await this.logAudit('message_read', messageId, 'Message', userId, {
          conversationId: message.conversationId
        });

        res.json({ success: true });

      } catch (error) {
        this.logger.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Failed to mark message as read' });
      }
    });

    // Create conversation
    this.app.post('/api/conversations', async (req, res) => {
      try {
        const { participants, title, type = 'group' } = req.body;

        if (!participants || participants.length < 2) {
          return res.status(400).json({ error: 'At least 2 participants required' });
        }

        const conversation = await this.prisma.conversation.create({
          data: {
            participants: participants.sort(),
            title,
            type
          }
        });

        await this.logAudit('conversation_created', conversation.id, 'Conversation', req.body.creatorId, {
          participantCount: participants.length,
          type
        });

        res.json(conversation);

      } catch (error) {
        this.logger.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
      }
    });
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

  public start(port: number = 4200): void {
    this.app.listen(port, () => {
      this.logger.info(`Messaging service running on port ${port}`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}