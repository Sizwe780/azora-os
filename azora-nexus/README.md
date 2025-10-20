# Azora Nexus - AI Recommendations & Neural Network Hub

Azora Nexus is the AI-powered recommendations and neural network hub of the Azora OS ecosystem. It provides intelligent personalization, behavioral analysis, and predictive insights to enhance user experiences across the platform.

## Features

### 🤖 AI-Powered Recommendations
- **Personalized Recommendations**: Generate tailored suggestions based on user behavior and preferences
- **Multi-Type Support**: Product, content, service, and personalized recommendations
- **Neural Processing**: Advanced AI algorithms for intent recognition and pattern analysis

### 🧠 Neural Intent Processing
- **Intent Analysis**: Extract user intentions from natural language input
- **Context Awareness**: Consider temporal, behavioral, and environmental factors
- **Sentiment Analysis**: Understand user emotions and satisfaction levels

### 📊 Advanced Analytics
- **Behavioral Insights**: Analyze user patterns and preferences
- **Predictive Analysis**: Forecast future user interests and actions
- **Trend Detection**: Identify behavioral changes over time
- **Anomaly Detection**: Spot unusual user behavior patterns

### 🔒 Enterprise Security
- **Authentication**: JWT-based secure authentication
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **Input Validation**: Comprehensive request validation
- **Audit Logging**: Detailed logging for compliance and debugging

### 📈 Monitoring & Observability
- **Prometheus Metrics**: Comprehensive performance monitoring
- **Structured Logging**: Winston-based logging with multiple transports
- **Health Checks**: Built-in health monitoring endpoints
- **API Documentation**: Swagger/OpenAPI documentation

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 4.4+
- OpenAI API Key

### Installation

1. **Clone and navigate to the service:**
   ```bash
   cd azora-nexus
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running on your system
   ```

5. **Build and run:**
   ```bash
   npm run build
   npm start
   ```

The service will be available at `http://localhost:3006`

## API Endpoints

### Recommendations
- `POST /api/recommendations/generate` - Generate personalized recommendations
- `GET /api/recommendations` - Get user recommendations
- `POST /api/recommendations/:id/feedback` - Submit recommendation feedback

### Neural Processing
- `POST /api/neural/process` - Process user input and extract intent
- `GET /api/neural/intents` - Get user neural intents
- `GET /api/neural/insights/:intentId` - Get insights from specific intent

### Insights
- `POST /api/insights/generate` - Generate user insights
- `GET /api/insights` - Get user insights
- `PUT /api/insights/:id/status` - Update insight status
- `GET /api/insights/categories` - Get available insight categories

### Analysis
- `POST /api/analysis/perform` - Perform user behavior analysis
- `GET /api/analysis` - Get user analyses
- `GET /api/analysis/:id` - Get specific analysis
- `GET /api/analysis/types` - Get available analysis types

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3006` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/azora-nexus` |
| `JWT_SECRET` | JWT signing secret | Required |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `METRICS_PORT` | Metrics server port | `9091` |
| `LOG_LEVEL` | Logging level | `info` |

### Database Models

- **User**: User profiles with preferences and neural data
- **Recommendation**: Generated recommendations with metadata
- **NeuralIntent**: Processed user intents with AI analysis
- **Insight**: Generated insights with recommendations
- **Analysis**: User behavior analyses with results

## Development

### Available Scripts

- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── services/        # Business logic services
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

### Testing

```bash
npm test
```

### API Documentation

When running, visit `http://localhost:3006/api-docs` for interactive API documentation.

## Monitoring

### Health Check
```
GET /health
```

### Metrics
Metrics are exposed on a separate port (default: 9091) for Prometheus scraping.

### Logs
Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## Docker Support

Build and run with Docker:

```bash
docker build -t azora-nexus .
docker run -p 3006:3006 --env-file .env azora-nexus
```

## Security Considerations

- All endpoints require authentication except `/health`
- Input validation on all requests
- Rate limiting to prevent abuse
- CORS configured for security
- Helmet.js for security headers
- Sensitive data encrypted in transit and at rest

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## License

This project is part of the Azora OS ecosystem. See LICENSE file for details.

## Support

For support, please contact the Azora OS development team or create an issue in the project repository.