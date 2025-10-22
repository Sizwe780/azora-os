/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file Advanced Event Bus Service
 * @description Production-grade event bus with Kafka/RabbitMQ integration, event sourcing, CQRS patterns, and enterprise messaging features
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Kafka } = require('kafkajs');
const amqp = require('amqplib');
const redis = require('redis');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const bodyParser = require('body-parser');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3005;

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'event-bus' },
  transports: [
    new winston.transports.File({ filename: 'logs/event-bus.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Redis client for caching and pub/sub
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// MongoDB client for event sourcing
let mongoClient;
let eventStore;

// Kafka client
let kafka;
let kafkaProducer;
let kafkaConsumer;

// RabbitMQ connection
let rabbitConnection;
let rabbitChannel;

// In-memory event store (fallback)
const memoryEventStore = new Map();
const subscriptions = new Map();
const deadLetterQueue = [];
const eventReplayBuffer = new Map();

// Event types and schemas
const EVENT_TYPES = {
  SECURITY: 'security.event.*',
  COMPLIANCE: 'compliance.event.*',
  BUSINESS: 'business.event.*',
  SYSTEM: 'system.event.*'
};

// CQRS Command/Event separation
class EventBus {
  constructor() {
    this.handlers = new Map();
    this.middlewares = [];
    this.eventStore = eventStore;
  }

  // Register event handler
  on(eventPattern, handler) {
    if (!this.handlers.has(eventPattern)) {
      this.handlers.set(eventPattern, []);
    }
    this.handlers.get(eventPattern).push(handler);
  }

  // Publish event with CQRS pattern
  async publish(event) {
    try {
      // Validate event
      const validatedEvent = await this.validateEvent(event);

      // Store event (Event Sourcing)
      await this.storeEvent(validatedEvent);

      // Apply middlewares
      let processedEvent = validatedEvent;
      for (const middleware of this.middlewares) {
        processedEvent = await middleware(processedEvent);
      }

      // Route to appropriate transport
      await this.routeEvent(processedEvent);

      // Notify subscribers
      await this.notifySubscribers(processedEvent);

      logger.info('Event published successfully', {
        eventId: processedEvent.id,
        type: processedEvent.type,
        aggregateId: processedEvent.aggregateId
      });

      return { success: true, eventId: processedEvent.id };
    } catch (error) {
      logger.error('Event publishing failed', {
        error: error.message,
        event: event.type
      });

      // Add to dead letter queue
      deadLetterQueue.push({
        event,
        error: error.message,
        timestamp: new Date(),
        retryCount: 0
      });

      throw error;
    }
  }

  // Subscribe to events
  async subscribe(eventPattern, callback, options = {}) {
    const subscriptionId = uuidv4();

    // Store subscription
    subscriptions.set(subscriptionId, {
      pattern: eventPattern,
      callback,
      options,
      createdAt: new Date()
    });

    // Subscribe to external systems if needed
    if (options.persistent) {
      await this.subscribeExternal(eventPattern, subscriptionId);
    }

    logger.info('Subscription created', { subscriptionId, pattern: eventPattern });
    return subscriptionId;
  }

  // Event replay for event sourcing
  async replayEvents(aggregateId, fromEventId = null, toEventId = null) {
    try {
      const query = { aggregateId };
      if (fromEventId) query._id = { $gt: fromEventId };
      if (toEventId) query._id = { ...query._id, $lte: toEventId };

      const events = await eventStore
        .find(query)
        .sort({ timestamp: 1 })
        .toArray();

      return events;
    } catch (error) {
      logger.error('Event replay failed', { error: error.message, aggregateId });
      throw error;
    }
  }

  // Validate event against schema
  async validateEvent(event) {
    const requiredFields = ['type', 'aggregateId', 'payload'];
    for (const field of requiredFields) {
      if (!event[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Add metadata
    return {
      id: event.id || uuidv4(),
      type: event.type,
      aggregateId: event.aggregateId,
      payload: event.payload,
      metadata: {
        timestamp: event.timestamp || new Date(),
        version: event.version || 1,
        correlationId: event.correlationId,
        causationId: event.causationId,
        userId: event.userId
      },
      ...event
    };
  }

  // Store event in event store
  async storeEvent(event) {
    try {
      if (eventStore) {
        await eventStore.insertOne({
          _id: event.id,
          ...event,
          storedAt: new Date()
        });
      } else {
        // Fallback to memory
        memoryEventStore.set(event.id, event);
      }

      // Cache recent events
      await redisClient.setEx(
        `event:${event.id}`,
        3600, // 1 hour
        JSON.stringify(event)
      );
    } catch (error) {
      logger.error('Event storage failed', { error: error.message, eventId: event.id });
      throw error;
    }
  }

  // Route event to appropriate transport
  async routeEvent(event) {
    const eventType = event.type;

    // Route to Kafka
    if (kafkaProducer && this.shouldUseKafka(eventType)) {
      await kafkaProducer.send({
        topic: eventType.replace(/\./g, '-'),
        messages: [{ value: JSON.stringify(event) }]
      });
    }

    // Route to RabbitMQ
    if (rabbitChannel && this.shouldUseRabbitMQ(eventType)) {
      const queue = eventType.replace(/\./g, '-');
      await rabbitChannel.assertQueue(queue, { durable: true });
      await rabbitChannel.sendToQueue(queue, Buffer.from(JSON.stringify(event)));
    }

    // Publish to Redis pub/sub
    await redisClient.publish(eventType, JSON.stringify(event));
  }

  // Notify subscribers
  async notifySubscribers(event) {
    for (const [subscriptionId, subscription] of subscriptions) {
      if (this.matchesPattern(event.type, subscription.pattern)) {
        try {
          await subscription.callback(event);
        } catch (error) {
          logger.error('Subscriber callback failed', {
            subscriptionId,
            error: error.message,
            eventId: event.id
          });
        }
      }
    }
  }

  // Pattern matching for event types
  matchesPattern(eventType, pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(eventType);
  }

  // Determine if event should use Kafka
  shouldUseKafka(eventType) {
    return eventType.startsWith('business.') || eventType.startsWith('system.');
  }

  // Determine if event should use RabbitMQ
  shouldUseRabbitMQ(eventType) {
    return eventType.startsWith('security.') || eventType.startsWith('compliance.');
  }

  // Subscribe to external systems
  async subscribeExternal(pattern, subscriptionId) {
    // Implementation for external subscriptions
    logger.info('External subscription created', { pattern, subscriptionId });
  }

  // Add middleware
  use(middleware) {
    this.middlewares.push(middleware);
  }
}

const eventBus = new EventBus();

// Initialize external systems
async function initializeExternalSystems() {
  try {
    // Initialize Kafka
    if (process.env.KAFKA_ENABLED === 'true') {
      kafka = new Kafka({
        clientId: 'azora-event-bus',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
      });

      kafkaProducer = kafka.producer();
      await kafkaProducer.connect();

      kafkaConsumer = kafka.consumer({ groupId: 'event-bus-group' });
      await kafkaConsumer.connect();

      // Subscribe to topics
      await kafkaConsumer.subscribe({ topics: ['security-*', 'compliance-*', 'business-*', 'system-*'] });

      // Start consuming
      await kafkaConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const event = JSON.parse(message.value.toString());
          await eventBus.publish(event);
        }
      });

      logger.info('Kafka integration initialized');
    }

    // Initialize RabbitMQ
    if (process.env.RABBITMQ_ENABLED === 'true') {
      rabbitConnection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      rabbitChannel = await rabbitConnection.createChannel();

      logger.info('RabbitMQ integration initialized');
    }

    // Initialize MongoDB
    if (process.env.MONGODB_URL) {
      mongoClient = new MongoClient(process.env.MONGODB_URL);
      await mongoClient.connect();
      const db = mongoClient.db('azora-events');
      eventStore = db.collection('events');

      // Create indexes
      await eventStore.createIndex({ 'type': 1 });
      await eventStore.createIndex({ 'aggregateId': 1 });
      await eventStore.createIndex({ 'metadata.timestamp': 1 });

      logger.info('MongoDB event store initialized');
    }

  } catch (error) {
    logger.error('External system initialization failed', { error: error.message });
  }
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(compression());
app.use(bodyParser.json({ limit: '10mb' }));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
}));

// Request logging
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    correlationId: req.headers['x-correlation-id']
  });
  next();
});

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'event-bus',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    subscriptions: subscriptions.size,
    deadLetterQueueSize: deadLetterQueue.length,
    kafka: !!kafkaProducer,
    rabbitmq: !!rabbitChannel,
    mongodb: !!eventStore
  });
});

// Publish event
app.post('/events/publish', async (req, res) => {
  try {
    const { topic, message, options = {} } = req.body;

    if (!topic || !message) {
      return res.status(400).json({ error: 'Topic and message are required' });
    }

    // Convert to event format
    const event = {
      type: topic,
      aggregateId: message.aggregateId || uuidv4(),
      payload: message,
      correlationId: req.headers['x-correlation-id'],
      userId: req.headers['x-user-id'],
      ...options
    };

    const result = await eventBus.publish(event);
    res.json(result);
  } catch (error) {
    logger.error('Event publish failed', { error: error.message });
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

// Subscribe to events
app.post('/events/subscribe', async (req, res) => {
  try {
    const { topic, callbackUrl, options = {} } = req.body;

    if (!topic || !callbackUrl) {
      return res.status(400).json({ error: 'Topic and callback URL are required' });
    }

    const subscriptionId = await eventBus.subscribe(topic, async (event) => {
      try {
        await axios.post(callbackUrl, event, {
          headers: {
            'Content-Type': 'application/json',
            'x-correlation-id': event.metadata?.correlationId
          },
          timeout: 5000
        });
      } catch (error) {
        logger.error('Webhook delivery failed', {
          callbackUrl,
          eventId: event.id,
          error: error.message
        });
      }
    }, options);

    res.json({ subscriptionId });
  } catch (error) {
    logger.error('Event subscription failed', { error: error.message });
    res.status(500).json({ error: 'Failed to subscribe to events' });
  }
});

// Get events by topic
app.get('/events/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    let events = [];

    if (eventStore) {
      // Query MongoDB
      events = await eventStore
        .find({ type: topic })
        .sort({ 'metadata.timestamp': -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .toArray();
    } else {
      // Query memory store
      events = Array.from(memoryEventStore.values())
        .filter(e => e.type === topic)
        .sort((a, b) => new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp))
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    }

    res.json({ events, total: events.length });
  } catch (error) {
    logger.error('Event retrieval failed', { error: error.message, topic: req.params.topic });
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// Event replay
app.get('/events/replay/:aggregateId', async (req, res) => {
  try {
    const { aggregateId } = req.params;
    const { from, to } = req.query;

    const events = await eventBus.replayEvents(aggregateId, from, to);
    res.json({ events });
  } catch (error) {
    logger.error('Event replay failed', { error: error.message, aggregateId: req.params.aggregateId });
    res.status(500).json({ error: 'Failed to replay events' });
  }
});

// Dead letter queue management
app.get('/admin/dead-letter-queue', (req, res) => {
  res.json({
    queue: deadLetterQueue,
    size: deadLetterQueue.length
  });
});

app.post('/admin/dead-letter-queue/:index/retry', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const failedEvent = deadLetterQueue[index];

    if (!failedEvent) {
      return res.status(404).json({ error: 'Event not found in dead letter queue' });
    }

    failedEvent.retryCount++;
    await eventBus.publish(failedEvent.event);

    // Remove from dead letter queue
    deadLetterQueue.splice(index, 1);

    res.json({ message: 'Event retried successfully' });
  } catch (error) {
    logger.error('Dead letter queue retry failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retry event' });
  }
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    subscriptions: subscriptions.size,
    eventsStored: eventStore ? 'mongodb' : memoryEventStore.size,
    deadLetterQueueSize: deadLetterQueue.length,
    kafkaConnected: !!kafkaProducer,
    rabbitmqConnected: !!rabbitChannel,
    mongodbConnected: !!eventStore
  });
});

// Scheduled tasks
cron.schedule('*/5 * * * *', async () => {
  // Process dead letter queue
  const now = new Date();
  const retryableEvents = deadLetterQueue.filter(event =>
    event.retryCount < 3 &&
    (now - event.timestamp) > 60000 // Wait 1 minute between retries
  );

  for (const failedEvent of retryableEvents) {
    try {
      await eventBus.publish(failedEvent.event);
      deadLetterQueue.splice(deadLetterQueue.indexOf(failedEvent), 1);
      logger.info('Dead letter event retried successfully', { eventId: failedEvent.event.id });
    } catch (error) {
      failedEvent.retryCount++;
      logger.warn('Dead letter event retry failed', {
        eventId: failedEvent.event.id,
        retryCount: failedEvent.retryCount,
        error: error.message
      });
    }
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing gracefully');

  try {
    if (kafkaProducer) await kafkaProducer.disconnect();
    if (kafkaConsumer) await kafkaConsumer.disconnect();
    if (rabbitChannel) await rabbitChannel.close();
    if (rabbitConnection) await rabbitConnection.close();
    if (mongoClient) await mongoClient.close();
    if (redisClient) await redisClient.quit();
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
  }

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    await redisClient.connect();
    await initializeExternalSystems();

    // Add event validation middleware
    eventBus.use(async (event) => {
      // Add any additional validation or enrichment
      return event;
    });

    app.listen(PORT, () => {
      logger.info(`🚀 Advanced Event Bus v2.0 running on port ${PORT}`, {
        features: [
          'Event Sourcing',
          'CQRS Patterns',
          'Kafka Integration',
          'RabbitMQ Integration',
          'Dead Letter Queue',
          'Event Replay',
          'Webhook Subscriptions',
          'Metrics Collection'
        ]
      });
      console.log(`🚀 Advanced Event Bus listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();