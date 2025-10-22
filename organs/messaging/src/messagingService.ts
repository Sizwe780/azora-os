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
import { PrismaClient } from '@prisma/client';
import CircuitBreaker from 'opossum';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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
    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health check endpoint
     *     description: Returns the health status of the messaging service and database connection
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
     *                   example: messaging-service
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
    /**
     * @swagger
     * /api/messages:
     *   post:
     *     summary: Send a message
     *     description: Sends a message to a user or conversation. Creates a new conversation if conversationId is not provided.
     *     tags: [Messages]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - from
     *               - text
     *             properties:
     *               from:
     *                 type: string
     *                 description: ID of the sender
     *               to:
     *                 type: string
     *                 description: ID of the recipient (required if conversationId not provided)
     *               text:
     *                 type: string
     *                 description: Message content
     *               conversationId:
     *                 type: string
     *                 description: ID of existing conversation (optional)
     *               messageType:
     *                 type: string
     *                 enum: [text, image, file]
     *                 default: text
     *                 description: Type of message content
     *               metadata:
     *                 type: object
     *                 description: Additional metadata (file URLs, image info, etc.)
     *     responses:
     *       200:
     *         description: Message sent successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 messageId:
     *                   type: string
     *                   description: Unique identifier for the sent message
     *                 conversationId:
     *                   type: string
     *                   description: ID of the conversation (new or existing)
     *       400:
     *         description: Missing required fields or invalid data
     *       500:
     *         description: Internal server error
     */
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
    /**
     * @swagger
     * /api/messages/{userId}:
     *   get:
     *     summary: Get user conversations and messages
     *     description: Retrieves all conversations and recent messages for a specific user
     *     tags: [Messages]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the user
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 50
     *         description: Maximum number of messages per conversation
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         description: Number of messages to skip
     *     responses:
     *       200:
     *         description: Conversations and messages retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 conversations:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                       participants:
     *                         type: array
     *                         items:
     *                           type: string
     *                       title:
     *                         type: string
     *                       type:
     *                         type: string
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                       updatedAt:
     *                         type: string
     *                         format: date-time
     *                       messages:
     *                         type: array
     *                         items:
     *                           $ref: '#/components/schemas/Message'
     *       500:
     *         description: Internal server error
     */
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
    /**
     * @swagger
     * /api/conversations/{conversationId}/messages:
     *   get:
     *     summary: Get messages in a conversation
     *     description: Retrieves all messages in a specific conversation
     *     tags: [Conversations]
     *     parameters:
     *       - in: path
     *         name: conversationId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the conversation
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 50
     *         description: Maximum number of messages to return
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         description: Number of messages to skip
     *     responses:
     *       200:
     *         description: Messages retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 messages:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Message'
     *       500:
     *         description: Internal server error
     */
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
    /**
     * @swagger
     * /api/messages/{messageId}/read:
     *   post:
     *     summary: Mark message as read
     *     description: Marks a message as read by a specific user
     *     tags: [Messages]
     *     parameters:
     *       - in: path
     *         name: messageId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID of the message to mark as read
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *             properties:
     *               userId:
     *                 type: string
     *                 description: ID of the user marking the message as read
     *     responses:
     *       200:
     *         description: Message marked as read successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *       400:
     *         description: Missing userId
     *       404:
     *         description: Message not found
     *       500:
     *         description: Internal server error
     */
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
    /**
     * @swagger
     * /api/conversations:
     *   post:
     *     summary: Create a new conversation
     *     description: Creates a new conversation (direct or group) with specified participants
     *     tags: [Conversations]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - participants
     *             properties:
     *               participants:
     *                 type: array
     *                 items:
     *                   type: string
     *                 minItems: 2
     *                 description: Array of user IDs to include in the conversation
     *               title:
     *                 type: string
     *                 description: Conversation title (for group conversations)
     *               type:
     *                 type: string
     *                 enum: [direct, group]
     *                 default: group
     *                 description: Type of conversation
     *               creatorId:
     *                 type: string
     *                 description: ID of the user creating the conversation (for audit logging)
     *     responses:
     *       200:
     *         description: Conversation created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Conversation'
     *       400:
     *         description: Invalid participants or missing required fields
     *       500:
     *         description: Internal server error
     */
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

  private setupSwagger(app: express.Application): void {
    const swaggerDefinition = {
      openapi: '3.0.0',
      info: {
        title: 'Azora OS Messaging Service',
        version: '2.0.0',
        description: 'Real-time messaging service with conversations, message status tracking, and audit logging',
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
          url: `http://localhost:${process.env.PORT || 4200}`,
          description: 'Development server',
        },
      ],
      components: {
        schemas: {
          Conversation: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for the conversation'
              },
              participants: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Array of user IDs participating in the conversation'
              },
              title: {
                type: 'string',
                description: 'Conversation title (for group chats)'
              },
              type: {
                type: 'string',
                enum: ['direct', 'group'],
                description: 'Type of conversation'
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Creation timestamp'
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Last update timestamp'
              }
            }
          },
          Message: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for the message'
              },
              conversationId: {
                type: 'string',
                description: 'ID of the conversation this message belongs to'
              },
              senderId: {
                type: 'string',
                description: 'ID of the user who sent the message'
              },
              content: {
                type: 'string',
                description: 'Message content'
              },
              messageType: {
                type: 'string',
                enum: ['text', 'image', 'file'],
                description: 'Type of message content'
              },
              metadata: {
                type: 'object',
                description: 'Additional metadata (file info, image URLs, etc.)'
              },
              readBy: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Array of user IDs who have read the message'
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Message creation timestamp'
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Message update timestamp'
              }
            }
          },
          MessageStatus: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for the message status'
              },
              messageId: {
                type: 'string',
                description: 'ID of the message'
              },
              userId: {
                type: 'string',
                description: 'ID of the user'
              },
              status: {
                type: 'string',
                enum: ['sent', 'delivered', 'read'],
                description: 'Read status of the message'
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Status update timestamp'
              }
            }
          }
        }
      }
    };

    const options = {
      swaggerDefinition,
      apis: ['./src/messagingService.ts'] // Path to the API docs
    };

    const specs = swaggerJsdoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
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