# API Gateway Service

Enterprise-grade API Gateway service for Azora ES with intelligent routing, circuit breakers, audit logging, and comprehensive API documentation.

## Features

- **Intelligent Service Routing**: Dynamic route registration and management
- **Circuit Breaker Pattern**: Automatic failure detection and recovery
- **Audit Logging**: Comprehensive logging of all API calls and system events
- **Rate Limiting**: Built-in rate limiting and slow-down protection
- **Security**: Helmet.js security headers, CORS configuration
- **Monitoring**: Health endpoints, actuator endpoints, response time tracking
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
cd services/api-gateway
npm install
```

### Environment Setup

Create a `.env` file in the service directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/azora_gateway"
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
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

The API Gateway provides comprehensive Swagger documentation at:
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## API Endpoints

### Service Routes

#### Register a Route
```http
POST /api/routes
Content-Type: application/json

{
  "serviceName": "user-service",
  "route": "/api/users",
  "targetUrl": "http://user-service:3001",
  "method": "GET"
}
```

#### Get All Routes
```http
GET /api/routes
```

#### Route to Services
All registered routes are automatically proxied. For example:
```http
GET /api/users  # Proxies to registered user-service
```

### Circuit Breakers

#### Get Circuit Breaker Status
```http
GET /api/circuit-breakers
```

Response:
```json
{
  "circuitBreakers": [
    {
      "serviceName": "user-service",
      "state": "closed",
      "failureCount": 0,
      "lastFailure": null
    }
  ]
}
```

### Audit Logs

#### Get Audit Logs
```http
GET /api/audit?entityType=ServiceRoute&limit=50
```

## Architecture

### Components

- **Route Manager**: Handles dynamic service route registration and lookup
- **Circuit Breaker**: Implements circuit breaker pattern for fault tolerance
- **Audit Logger**: Logs all API calls and system events
- **Proxy Middleware**: Routes requests to appropriate services
- **Swagger Generator**: Auto-generates API documentation

### Database Schema

- `ServiceRoute`: Registered service routes
- `ApiCall`: Individual API call logs
- `CircuitBreaker`: Circuit breaker states
- `AuditLog`: System audit events

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Service port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:5173,localhost:3000 |

### Circuit Breaker Configuration

Circuit breakers are automatically configured for each service with:
- **Failure Threshold**: 5 consecutive failures
- **Recovery Timeout**: 60 seconds
- **Monitoring Window**: 10 seconds

## Monitoring

### Health Endpoints

- **Health Check**: `GET /health`
- **Actuator Info**: `GET /info`
- **Metrics**: `GET /metrics`

### Logging

All requests are logged with:
- Request/response details
- Response times
- Error information
- Circuit breaker events

## Development

### Project Structure

```
src/
├── index.ts              # Service entry point
├── apiGatewayService.ts  # Core service logic
├── apiGatewayRoutes.ts   # API route definitions
└── types.ts              # TypeScript type definitions

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

## Security

- **Input Validation**: All inputs validated using Joi schemas
- **Rate Limiting**: 1000 requests per 15 minutes per IP
- **CORS**: Configured allowed origins
- **Security Headers**: Helmet.js provides comprehensive security headers
- **Audit Logging**: All sensitive operations logged

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update API documentation
4. Ensure all tests pass
5. Update this README if needed

## License

This project is licensed under the AZORA PROPRIETARY LICENSE - see the LICENSE file for details.