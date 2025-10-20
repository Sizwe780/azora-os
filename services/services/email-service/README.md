# Email Service

Enterprise-grade email service for Azora OS with template management, queuing system, SMTP integration, circuit breaker protection, and comprehensive API documentation.

## Features

- **Email Templates**: Create and manage reusable email templates with variable substitution
- **Queue Management**: Asynchronous email processing with priority queuing and retry logic
- **SMTP Integration**: Configurable SMTP transport with authentication
- **Circuit Breaker**: Automatic failure detection and recovery for SMTP operations
- **Audit Logging**: Comprehensive logging of all email operations and system events
- **Template Processing**: Dynamic content substitution with variable support
- **Health Monitoring**: Service health checks and database connectivity monitoring
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- SMTP server (Gmail, SendGrid, etc.)
- npm or yarn

### Installation

```bash
cd services/services/email-service
npm install
```

### Environment Setup

Create a `.env` file in the service directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/azora_email"
PORT=3000
NODE_ENV=development

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
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

The Email Service provides comprehensive Swagger documentation at:
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

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
  "service": "email-service",
  "version": "2.0.0",
  "database": "connected",
  "timestamp": "2025-10-20T10:30:00.000Z"
}
```

### Email Operations

#### Send Email
```http
POST /api/email/send
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Welcome to Azora OS",
  "html": "<h1>Welcome {{userName}}!</h1><p>Thank you for joining us.</p>",
  "templateId": "welcome-template",
  "variables": {
    "userName": "John Doe",
    "companyName": "Azora OS"
  },
  "priority": 5,
  "userId": "user123"
}
```

#### Process Email Queue
```http
POST /api/email/process-queue
```

This endpoint processes up to 10 pending emails from the queue.

### Template Management

#### Get All Templates
```http
GET /api/email/templates
```

Response:
```json
[
  {
    "id": "template123",
    "name": "Welcome Email",
    "subject": "Welcome to {{companyName}}",
    "createdAt": "2025-10-20T10:00:00.000Z"
  }
]
```

#### Create Template
```http
POST /api/email/templates
Content-Type: application/json

{
  "name": "Welcome Email",
  "subject": "Welcome to {{companyName}}",
  "htmlContent": "<h1>Welcome {{userName}}!</h1><p>Welcome to {{companyName}}.</p>",
  "textContent": "Welcome {{userName}}! Welcome to {{companyName}}.",
  "variables": {
    "userName": "string",
    "companyName": "string"
  },
  "userId": "user123"
}
```

## Template Variables

Templates support variable substitution using double curly braces:

```html
<h1>Welcome {{userName}}!</h1>
<p>Thank you for joining {{companyName}}.</p>
<p>Your account is now active at {{loginUrl}}.</p>
```

Variables are passed in the `variables` object when sending emails:

```json
{
  "userName": "John Doe",
  "companyName": "Azora OS",
  "loginUrl": "https://azora.world/login"
}
```

## Queue System

### Priority Levels

- **1-3**: Low priority (bulk emails, newsletters)
- **4-6**: Normal priority (transactional emails)
- **7-10**: High priority (password resets, security alerts)

### Status Flow

```
pending → processing → sent
    ↓
  failed (after max retries)
```

### Retry Logic

- **Max Retries**: 3 attempts per email
- **Retry Delay**: Exponential backoff (1min, 2min, 3min)
- **Circuit Breaker**: Automatic SMTP failure detection

## Architecture

### Components

- **EmailService**: Main service class with Express app setup
- **Template Processor**: Handles variable substitution in templates
- **Queue Manager**: Manages email queuing and processing
- **SMTP Transport**: Configurable email transport layer
- **Circuit Breaker**: Fault tolerance for SMTP operations
- **Audit Logger**: Comprehensive operation logging

### Database Schema

- `EmailTemplate`: Reusable email templates
- `EmailQueue`: Queued emails awaiting processing
- `EmailLog`: Historical email delivery records
- `AuditLog`: System audit events

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Service port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `SMTP_HOST` | SMTP server hostname | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | 587 |
| `EMAIL_USER` | SMTP authentication username | Required |
| `EMAIL_PASS` | SMTP authentication password | Required |

### Circuit Breaker Configuration

- **Timeout**: 10 seconds per email
- **Error Threshold**: 50% failure rate
- **Reset Timeout**: 30 seconds

## Development

### Project Structure

```
src/
├── index.ts              # Service entry point
├── emailService.ts       # Core service logic
├── emailRoutes.ts        # API route definitions (future)
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

## SMTP Providers

### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
EMAIL_USER=your-ses-smtp-username
EMAIL_PASS=your-ses-smtp-password
```

## Monitoring

### Health Endpoints

- **Health Check**: `GET /health`
- **Swagger Docs**: `GET /api-docs`

### Logging

All operations are logged with Winston:
- Email sending attempts and results
- Template creation/modification
- Queue processing statistics
- SMTP connection issues
- Circuit breaker events

## Security

- **Input Validation**: All inputs validated before processing
- **Audit Logging**: All email operations logged with user context
- **Rate Limiting**: Built-in rate limiting (inherited from shared config)
- **Template Sanitization**: HTML templates sanitized to prevent XSS
- **SMTP Authentication**: Secure credential management

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
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