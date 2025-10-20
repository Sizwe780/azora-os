# Messaging Service

Real-time messaging service for Azora OS with conversation management, message status tracking, circuit breaker protection, and comprehensive API documentation.

## Features

- **Real-time Messaging**: Send and receive messages with support for text, images, and files
- **Conversation Management**: Create direct and group conversations with participant management
- **Message Status Tracking**: Track read receipts and delivery status
- **Audit Logging**: Comprehensive logging of all messaging operations and system events
- **Circuit Breaker**: Automatic failure detection and recovery for database operations
- **Message Metadata**: Support for rich message content with custom metadata
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
cd services/messaging
npm install
```

### Environment Setup

Create a `.env` file in the service directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/azora_messaging"
PORT=4200
NODE_ENV=development
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push
```

### Running the Service

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## API Documentation

The Messaging Service provides comprehensive Swagger documentation at:
- **Swagger UI**: http://localhost:4200/api-docs
- **OpenAPI JSON**: http://localhost:4200/api-docs.json

## API Endpoints

### Health Monitoring

#### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "messaging-service",
  "version": "2.0.0",
  "database": "connected",
  "timestamp": "2025-10-20T10:30:00.000Z"
}
```

### Messaging Operations

#### Send Message
```http
POST /api/messages
Content-Type: application/json

{
  "from": "user123",
  "to": "user456",
  "text": "Hello, how are you?",
  "messageType": "text",
  "metadata": {
    "priority": "normal"
  }
}
```

#### Get User Messages
```http
GET /api/messages/{userId}?limit=50&offset=0
```

Response:
```json
{
  "conversations": [
    {
      "id": "conv123",
      "participants": ["user123", "user456"],
      "title": null,
      "type": "direct",
      "createdAt": "2025-10-20T10:00:00.000Z",
      "updatedAt": "2025-10-20T10:30:00.000Z",
      "messages": [
        {
          "id": "msg123",
          "conversationId": "conv123",
          "senderId": "user456",
          "content": "Hello, how are you?",
          "messageType": "text",
          "metadata": {},
          "readBy": ["user123"],
          "createdAt": "2025-10-20T10:30:00.000Z",
          "updatedAt": "2025-10-20T10:30:00.000Z"
        }
      ]
    }
  ]
}
```

#### Get Conversation Messages
```http
GET /api/conversations/{conversationId}/messages?limit=50&offset=0
```

#### Mark Message as Read
```http
POST /api/messages/{messageId}/read
Content-Type: application/json

{
  "userId": "user123"
}
```

### Conversation Management

#### Create Conversation
```http
POST /api/conversations
Content-Type: application/json

{
  "participants": ["user123", "user456", "user789"],
  "title": "Project Team",
  "type": "group",
  "creatorId": "user123"
}
```

Response:
```json
{
  "id": "conv456",
  "participants": ["user123", "user456", "user789"],
  "title": "Project Team",
  "type": "group",
  "createdAt": "2025-10-20T10:30:00.000Z",
  "updatedAt": "2025-10-20T10:30:00.000Z"
}
```

## Message Types

### Text Messages
```json
{
  "messageType": "text",
  "content": "Hello, world!",
  "metadata": {}
}
```

### Image Messages
```json
{
  "messageType": "image",
  "content": "Check out this photo!",
  "metadata": {
    "imageUrl": "https://example.com/image.jpg",
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "width": 1920,
    "height": 1080
  }
}
```

### File Messages
```json
{
  "messageType": "file",
  "content": "Here's the document you requested",
  "metadata": {
    "fileName": "document.pdf",
    "fileSize": 2048576,
    "fileUrl": "https://example.com/document.pdf",
    "mimeType": "application/pdf"
  }
}
```

## Conversation Types

### Direct Conversations
- **Participants**: Exactly 2 users
- **Type**: `"direct"`
- **Title**: `null` (automatically managed)

### Group Conversations
- **Participants**: 2 or more users
- **Type**: `"group"`
- **Title**: Optional group name

## Message Status

Messages support read receipts and delivery tracking:

- **Sent**: Message created and queued
- **Delivered**: Message received by recipient(s)
- **Read**: Message viewed by recipient(s)

## Architecture

### Components

- **MessagingService**: Main service class with Express app setup
- **Conversation Manager**: Handles conversation creation and participant management
- **Message Processor**: Processes incoming messages and updates conversation state
- **Status Tracker**: Manages message read receipts and delivery status
- **Audit Logger**: Comprehensive operation logging and security monitoring
- **Circuit Breaker**: Fault tolerance for database operations

### Database Schema

- `Conversation`: Chat conversations with participant lists
- `Message`: Individual messages within conversations
- `MessageStatus`: Read/delivery status for messages
- `AuditLog`: System audit events and operation logs

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Service port | 4200 |
| `NODE_ENV` | Environment mode | development |

### Circuit Breaker Configuration

- **Timeout**: 10 seconds per operation
- **Error Threshold**: 50% failure rate
- **Reset Timeout**: 30 seconds

## Development

### Project Structure

```
src/
├── index.ts              # Service entry point
├── messagingService.ts   # Core service logic
prisma/
└── schema.prisma         # Database schema
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

## Real-time Features

The messaging service is designed to work with real-time communication systems:

### WebSocket Integration
- Messages can be broadcast to connected clients
- Real-time conversation updates
- Live typing indicators
- Online/offline status

### Push Notifications
- Integration with push notification services
- Configurable notification preferences
- Silent/background message delivery

## Security

- **Input Validation**: All inputs validated before processing
- **Audit Logging**: All messaging operations logged with user context
- **Rate Limiting**: Built-in rate limiting (inherited from shared config)
- **Participant Verification**: Conversation access control
- **Message Encryption**: Support for end-to-end encryption

## Monitoring

### Health Endpoints

- **Health Check**: `GET /health`
- **Swagger Docs**: `GET /api-docs`

### Logging

All operations are logged with Winston:
- Message sending and receiving
- Conversation creation and updates
- Read receipt processing
- Database operation failures
- Circuit breaker events

## Scaling

### Horizontal Scaling
- Stateless service design
- Database connection pooling
- Redis integration for caching
- Load balancer friendly

### Performance Optimization
- Message pagination and limits
- Database query optimization
- Connection pooling
- Caching strategies

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4200
CMD ["npm", "start"]
```

### Kubernetes

The service includes Kubernetes manifests for production deployment with:
- Rolling updates
- Health checks
- Resource limits
- ConfigMaps for environment variables

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update API documentation
4. Ensure all tests pass
5. Update this README if needed

## License

See LICENSE file in the root directory.