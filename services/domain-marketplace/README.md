# Domain Marketplace Service

A comprehensive domain registration and marketplace service for Azora OS, built with Node.js, Express, and MongoDB.

## Features

- **Domain Registration**: Register and manage domain ownership
- **Marketplace**: Buy and sell domains with bidding system
- **Domain Availability**: Check domain availability and DNS status
- **Watchlist**: Track domains of interest with price alerts
- **Categories**: Organize domains by categories
- **Real-time Metrics**: Prometheus metrics for monitoring
- **Rate Limiting**: Built-in rate limiting for API protection
- **Swagger Documentation**: Complete API documentation

## API Endpoints

### Domain Management
- `POST /api/v1/domains/check` - Check domain availability
- `POST /api/v1/domains/register` - Register a new domain
- `GET /api/v1/domains/:domain` - Get domain details
- `PUT /api/v1/domains/:domain` - Update domain details
- `DELETE /api/v1/domains/:domain` - Delete domain listing

### Marketplace
- `POST /api/v1/marketplace/list` - List domain for sale
- `POST /api/v1/marketplace/bid` - Place bid on domain
- `GET /api/v1/marketplace/bids/:domain` - Get bids for domain
- `POST /api/v1/marketplace/buy/:domain` - Buy domain immediately
- `POST /api/v1/marketplace/watchlist` - Add domain to watchlist
- `GET /api/v1/marketplace/watchlist` - Get user's watchlist

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:slug` - Get category by slug
- `POST /api/v1/categories` - Create new category

### Health & Monitoring
- `GET /api/v1/health` - Service health check
- `GET /api/v1/health/ready` - Readiness check
- `GET /api/v1/health/metrics` - Service metrics

## Installation

```bash
npm install
```

## Environment Variables

```env
PORT=3007
MONGODB_URI=mongodb://localhost:27017/domain-marketplace
NODE_ENV=development
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## API Documentation

Access the Swagger documentation at `http://localhost:3007/api-docs`

## Architecture

- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **TypeScript**: Type safety
- **Winston**: Logging
- **Prometheus**: Metrics collection
- **Swagger**: API documentation

## Database Models

- **DomainListing**: Domain ownership and marketplace data
- **DomainBid**: Bidding system for domains
- **DomainCategory**: Domain categorization
- **DomainWatchlist**: User watchlists

## Security Features

- Rate limiting on all endpoints
- Input validation and sanitization
- Authentication middleware integration
- CORS protection
- Helmet security headers

## Monitoring

The service exposes Prometheus metrics at `/api/v1/health/metrics` and includes:

- HTTP request metrics
- Domain statistics
- Error rates
- Performance metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

See LICENSE file in the root directory.