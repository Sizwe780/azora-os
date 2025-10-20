# AI Website Builder Service

An AI-powered website generation, customization, and deployment service for Azora OS, built with Node.js, Express, MongoDB, and OpenAI.

## Features

- **AI Website Generation**: Generate complete websites using OpenAI GPT models
- **Template System**: Pre-built templates for different business types
- **Customization**: Modify generated websites with custom content and styling
- **One-Click Deployment**: Deploy websites to subdomains or custom domains
- **Real-time Metrics**: Prometheus metrics for monitoring and analytics
- **Rate Limiting**: Built-in rate limiting for API protection
- **Swagger Documentation**: Complete API documentation

## API Endpoints

### Website Generation
- `POST /api/v1/websites/generate` - Generate a new website using AI
- `GET /api/v1/websites` - Get user's websites
- `GET /api/v1/websites/{id}` - Get website details
- `PUT /api/v1/websites/{id}` - Update website customizations
- `DELETE /api/v1/websites/{id}` - Delete website

### Templates
- `GET /api/v1/templates` - Get all available templates
- `GET /api/v1/templates/{id}` - Get template details
- `GET /api/v1/templates/categories` - Get template categories
- `GET /api/v1/templates/business-types` - Get business types
- `POST /api/v1/templates/{id}/use` - Record template usage

### Deployment
- `POST /api/v1/deployment/deploy` - Deploy a website
- `GET /api/v1/deployment` - Get user's deployments
- `GET /api/v1/deployment/{id}` - Get deployment status
- `POST /api/v1/deployment/{id}/redeploy` - Redeploy website
- `DELETE /api/v1/deployment/{id}` - Delete deployment

### Health & Monitoring
- `GET /api/v1/health` - Service health check
- `GET /api/v1/health/ready` - Readiness check
- `GET /api/v1/health/metrics` - Service metrics
- `GET /api/v1/health/stats` - Service statistics

## Installation

```bash
npm install
```

## Environment Variables

```env
PORT=3008
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-website-builder
OPENAI_API_KEY=your-openai-api-key-here
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

Access the Swagger documentation at `http://localhost:3008/api-docs`

## Architecture

- **Express.js**: Web framework with TypeScript
- **MongoDB**: Database with Mongoose ODM
- **OpenAI**: AI-powered content generation
- **Winston**: Structured logging
- **Prometheus**: Metrics collection
- **Swagger**: API documentation

## Database Models

- **WebsiteGeneration**: Website creation and customization data
- **WebsiteTemplate**: Pre-built website templates
- **WebsiteDeployment**: Deployment configuration and status

## AI Features

- **Content Generation**: AI-generated HTML, CSS, and JavaScript
- **Business-Specific**: Tailored content for different business types
- **Responsive Design**: Mobile-first responsive websites
- **Modern UI**: Clean, professional designs with animations

## Deployment Features

- **Subdomain Hosting**: Automatic subdomain provisioning
- **Custom Domains**: Support for custom domain deployment
- **Static Hosting**: Optimized static file serving
- **CDN Integration**: Fast global content delivery

## Security Features

- Rate limiting on all endpoints
- Input validation and sanitization
- Authentication middleware integration
- CORS protection
- Helmet security headers

## Monitoring

The service exposes Prometheus metrics at `/api/v1/health/metrics` and includes:

- Website generation metrics
- Deployment statistics
- AI request tracking
- Performance monitoring
- Error rates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

See LICENSE file in the root directory.