# Azora OS Email Hosting Service

A comprehensive email hosting service built for Azora OS, providing domain management, SMTP configuration, and email routing capabilities with enterprise-grade features.

## Features

### Domain Management
- **Domain Registration**: Register and manage custom domains
- **DNS Management**: Configure DNS records (A, AAAA, CNAME, MX, TXT, SRV, PTR)
- **Domain Verification**: Verify domain ownership via DNS TXT records
- **Domain Status Tracking**: Monitor domain status (pending, active, suspended, expired)

### SMTP Configuration
- **SMTP Setup**: Configure SMTP servers for each domain
- **Authentication**: Support for username/password authentication
- **Security**: TLS/SSL encryption support
- **Connection Testing**: Test SMTP configurations before use

### Email Security
- **DKIM**: DomainKeys Identified Mail signing
- **SPF**: Sender Policy Framework records
- **DMARC**: Domain-based Message Authentication, Reporting, and Conformance

### Email Management
- **Email Sending**: Send emails via configured SMTP servers
- **Queue Management**: Handle email queuing and retry logic
- **Delivery Tracking**: Monitor email delivery status
- **Attachment Support**: Send emails with attachments
- **Scheduling**: Schedule emails for future sending

### Monitoring & Analytics
- **Health Checks**: Comprehensive service health monitoring
- **Metrics**: Prometheus-compatible metrics collection
- **Logging**: Structured logging with Winston
- **Rate Limiting**: API rate limiting and abuse protection

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Docker (optional)

### Installation

1. **Clone and install dependencies:**
```bash
cd services/email-hosting
npm install
```

2. **Environment Setup:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7-jammy

# Or using local MongoDB installation
mongod
```

4. **Build and run:**
```bash
npm run build
npm start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f email-hosting
```

## API Documentation

The service provides a comprehensive REST API documented with Swagger/OpenAPI.

### Access Swagger UI
- **URL**: `http://localhost:3006/api-docs`
- **Interactive Documentation**: Full API specification with try-it functionality

### Core Endpoints

#### Domain Management
- `GET /api/v1/domains` - List domains
- `POST /api/v1/domains` - Register domain
- `GET /api/v1/domains/:id` - Get domain details
- `PUT /api/v1/domains/:id/dns` - Update DNS records
- `PUT /api/v1/domains/:id/smtp` - Update SMTP config
- `POST /api/v1/domains/:id/verify` - Verify domain ownership
- `DELETE /api/v1/domains/:id` - Delete domain

#### SMTP Configuration
- `POST /api/v1/smtp/test` - Test SMTP configuration
- `GET /api/v1/smtp/domains/:domainId/config` - Get SMTP config
- `PUT /api/v1/smtp/domains/:domainId/config` - Update SMTP config
- `POST /api/v1/smtp/domains/:domainId/dkim` - Generate DKIM keys
- `POST /api/v1/smtp/domains/:domainId/spf` - Generate SPF record
- `POST /api/v1/smtp/domains/:domainId/dmarc` - Generate DMARC record

#### Email Operations
- `POST /api/v1/emails` - Send email
- `GET /api/v1/emails` - List emails
- `GET /api/v1/emails/:id` - Get email details
- `POST /api/v1/emails/:id/resend` - Resend failed email
- `DELETE /api/v1/emails/:id` - Delete email
- `GET /api/v1/emails/stats` - Get email statistics

#### Health & Monitoring
- `GET /health` - Service health status
- `GET /health/ready` - Readiness check
- `GET /health/metrics` - Detailed metrics
- `GET /health/ping` - Simple ping check
- `GET /metrics` - Prometheus metrics

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Service port | `3006` | No |
| `NODE_ENV` | Environment | `development` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/azora-email-hosting` | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes (in production) |
| `LOG_LEVEL` | Logging level | `info` | No |
| `SMTP_TIMEOUT` | SMTP connection timeout (ms) | `30000` | No |
| `MAX_ATTACHMENT_SIZE` | Max attachment size (bytes) | `10485760` (10MB) | No |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `900000` (15min) | No |
| `RATE_LIMIT_MAX` | Max requests per window | `100` | No |

### Example .env file
```env
PORT=3006
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/azora-email-hosting
JWT_SECRET=your-super-secret-jwt-key-here
LOG_LEVEL=info
SMTP_TIMEOUT=30000
MAX_ATTACHMENT_SIZE=10485760
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## Domain Setup Guide

### 1. Register Domain
```bash
curl -X POST http://localhost:3006/api/v1/domains \
  -H "Content-Type: application/json" \
  -d '{"name": "yourdomain.com"}'
```

### 2. Add DNS TXT Record
Add the verification TXT record to your DNS:
```
Name: yourdomain.com
Type: TXT
Value: azora-verify=abc123def456
```

### 3. Verify Domain
```bash
curl -X POST http://localhost:3006/api/v1/domains/{domain-id}/verify
```

### 4. Configure SMTP
```bash
curl -X PUT http://localhost:3006/api/v1/smtp/domains/{domain-id}/config \
  -H "Content-Type: application/json" \
  -d '{
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "username": "your-email@gmail.com",
    "password": "your-app-password"
  }'
```

### 5. Send Email
```bash
curl -X POST http://localhost:3006/api/v1/emails \
  -H "Content-Type: application/json" \
  -d '{
    "from": "sender@yourdomain.com",
    "to": ["recipient@example.com"],
    "subject": "Test Email",
    "text": "Hello, World!",
    "html": "<h1>Hello, World!</h1>"
  }'
```

## Security Features

### Authentication
- JWT-based authentication
- API key support
- Rate limiting per IP and user

### Email Security
- DKIM signing for email authentication
- SPF record generation
- DMARC policy configuration
- Attachment size limits
- Content validation

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure headers with Helmet.js

## Monitoring

### Health Checks
- **Service Health**: Overall service status
- **Database Connectivity**: MongoDB connection status
- **SMTP Connectivity**: Email sending capability

### Metrics
- **HTTP Metrics**: Request count, duration, status codes
- **Email Metrics**: Sent, delivered, bounced, failed counts
- **Domain Metrics**: Active domains, DNS operations
- **System Metrics**: Memory usage, CPU usage

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking
- Performance monitoring

## Development

### Project Structure
```
src/
├── config/           # Configuration files
├── middleware/       # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions
└── index.ts         # Application entry point

docker/              # Docker configuration
docs/               # Documentation
```

### Available Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Production Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  email-hosting:
    image: azora/email-hosting:latest
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/azora-email-hosting
    ports:
      - "3006:3006"
    depends_on:
      - mongodb
```

### Kubernetes
See `/k8s/` directory for Kubernetes deployment manifests.

### Load Balancing
- Configure load balancer for high availability
- Use sticky sessions for SMTP connections
- Implement health check endpoints

## Troubleshooting

### Common Issues

#### Domain Verification Fails
- Ensure DNS TXT record is properly propagated
- Wait for DNS propagation (can take up to 48 hours)
- Check DNS record format: `azora-verify={token}`

#### SMTP Connection Fails
- Verify SMTP credentials
- Check firewall settings
- Ensure correct port and security settings
- Test SMTP connection manually

#### Emails Not Sending
- Check email queue status
- Verify domain and SMTP configuration
- Check service logs for errors
- Ensure rate limits are not exceeded

#### High Memory Usage
- Monitor email queue size
- Check for memory leaks in attachments
- Configure appropriate resource limits

### Logs
```bash
# View application logs
docker-compose logs -f email-hosting

# View MongoDB logs
docker-compose logs -f mongodb

# Check service health
curl http://localhost:3006/health
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Comprehensive test coverage

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: See `/docs/` directory
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@azora-os.com

## Roadmap

### Planned Features
- [ ] Webhook notifications for email events
- [ ] Email templates and campaigns
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant architecture
- [ ] Integration with popular email clients
- [ ] Advanced spam filtering
- [ ] Email archiving and compliance features