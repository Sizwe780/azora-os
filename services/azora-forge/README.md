# Azora Forge - P2P Marketplace Service

Azora Forge is the P2P marketplace component of the Azora ES, enabling users to exchange digital goods and services using AZR tokens. This service implements the "Tuckshop Protocol" for permissionless value exchange between neurons (users) in the ecosystem.

## Features

- **P2P Marketplace**: Direct peer-to-peer trading of digital goods and services
- **AZR Integration**: Native support for Azora Coin transactions
- **Category System**: Organized marketplace with predefined categories
- **Advanced Search**: Full-text search with filters and sorting
- **Transaction Tracking**: Complete transaction history and status tracking
- **API Documentation**: Swagger/OpenAPI documentation
- **Monitoring**: Prometheus metrics and health checks
- **Security**: Rate limiting, input validation, and secure headers

## Architecture

### Core Components

- **Express.js Server**: RESTful API with middleware stack
- **MongoDB**: Document database for listings, categories, and transactions
- **JWT Authentication**: Secure user authentication
- **Prometheus Metrics**: Comprehensive monitoring and observability
- **Winston Logging**: Structured logging with multiple transports

### Key Models

- **Listing**: Marketplace listings with seller info, pricing, and metadata
- **Category**: Hierarchical category system for organization
- **Transaction**: Transaction records for audit and tracking

## API Endpoints

### Listings
- `GET /api/listings` - Get all active listings
- `GET /api/listings/:id` - Get listing by ID
- `POST /api/listings` - Create new listing
- `POST /api/listings/:id/purchase` - Purchase a listing

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category (admin)

### Search
- `GET /api/search/listings` - Advanced search with filters
- `GET /api/search/suggestions` - Search suggestions

### Health & Monitoring
- `GET /api/health` - Basic health check
- `GET /api/health/ready` - Readiness check
- `GET /api/health/live` - Liveness check
- `GET /api/health/metrics` - Prometheus metrics
- `GET /api/health/stats` - Service statistics

## Installation

### Prerequisites

- Node.js 18+
- MongoDB 7+
- Docker & Docker Compose (for containerized deployment)

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start MongoDB (using Docker):
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:7-jammy
   ```

5. Run the service:
   ```bash
   npm run dev
   ```

### Docker Deployment

1. Build and start services:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

2. Check service health:
   ```bash
   curl http://localhost:3005/api/health
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3005` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/azora-forge` |
| `JWT_SECRET` | JWT signing secret | Required |
| `NODE_ENV` | Environment mode | `development` |

### Database Initialization

The service automatically initializes the database with:
- Default categories (Development, Design, Writing, etc.)
- Required indexes for performance
- Sample data structure

## Development

### Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Testing

```bash
npm test
```

### API Documentation

Access Swagger UI at: `http://localhost:3005/api-docs`

## Security

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using express-validator
- **Security Headers**: Helmet.js for secure HTTP headers
- **CORS**: Configured for cross-origin requests
- **Authentication**: JWT-based authentication required for protected routes

## Monitoring

### Metrics

- HTTP request metrics (count, duration, status codes)
- Database connection status
- Service health and readiness
- Custom business metrics (listings created, transactions)

### Health Checks

- **Health**: Basic service availability
- **Readiness**: Database connectivity and service readiness
- **Liveness**: Service liveness for container orchestration

## Constitution Compliance

This service implements Article VIII.5 of the Azora Constitution:

> A "Neural Cluster" shall be established on ext.azora.world to facilitate the permissionless exchange of digital goods and services between all "Neurons" (users, students, pods) in the system.

## Contributing

1. Follow the established code style and patterns
2. Add tests for new features
3. Update API documentation
4. Ensure all health checks pass
5. Follow the Azora ES development guidelines

## License

This project is licensed under the AZORA PROPRIETARY LICENSE - see the LICENSE file for details.