# Azora Nexus - Autonomous AI Agent

**The central consciousness of Azora ES - An autonomous AI agent deeply integrated within the enterprise suite, capable of understanding user intent, executing complex tasks, providing contextual assistance, performing self-healing, driving system evolution, and conducting academic research, all while being immutably bound by the Azora Constitution.**

## Vision

Azora Nexus functions as the central nervous system of Azora ES, embodying six core capabilities:

- **🧠 Listen (Perceive)**: Natural language understanding and intent recognition
- **⚡ Do (Act)**: Complex task execution across the enterprise ecosystem
- **🤝 Help (Assist)**: Contextual, proactive user assistance
- **🔧 Heal (Maintain)**: Autonomous system maintenance and self-healing
- **🚀 Develop (Evolve)**: System evolution and feature development
- **🔬 Discover (Research)**: Academic research and knowledge creation

## Core Architecture

### Platform Architecture & Integration

#### Core Engine
- **Autonomous Loop**: Recursive Perceive → Plan → Act cycle managing agent state
- **Reasoning/LLM**: Fine-tuned Large Language Model trained on Azora schemas, APIs, codebase, and constitution
- **Tool Layer**: Secure API wrapper (`genome/agent-tools`) for calling functions across all Azora organs
- **Observation Loop**: Real-time event streaming from `azora-lattice` event bus
- **Constitutional Governor**: Non-negotiable validation module ensuring all actions comply with Azora Constitution

#### Memory Systems
- **Short-Term Memory**: Redis cache for active conversations, task context, and immediate sensory data
- **Long-Term Memory**: PostgreSQL with pgvector for user profiles, historical interactions, learned procedures, and semantic knowledge retrieval

### Core Capabilities

#### Listen (Perceive)
- Natural Language Understanding for complex user intent parsing
- Entity recognition (services, users, amounts, contexts)
- Multi-modal input processing (voice, text, system events)

#### Do (Act)
- **Planning**: Decompose high-level requests into precise API call sequences
- **Execution**: Secure multi-service orchestration with dependency management
- **Confirmation**: Human-readable success/failure reporting with action summaries

#### Help (Assist)
- **User Context**: Personalized assistance based on profiles, roles, and activity
- **System Knowledge**: Comprehensive answers about Azora ES using vectorized knowledge base
- **Proactive Support**: Context-aware suggestions and resource recommendations

#### Heal (Maintain)
- **Failure Detection**: Real-time monitoring of system health and error patterns
- **Root Cause Analysis**: AI-powered diagnosis using reasoning engine
- **Automated Remediation**: Execute recovery actions from service restarts to code fixes

#### Develop (Evolve)
- **Opportunity Analysis**: Identify inefficiencies, features, and risks from system data
- **Proposal Generation**: Draft detailed, data-backed proposals for Azora Council
- **Code Contribution**: Generate fixes and features with automated testing and PR creation

#### Discover (Research)
- **Hypothesis Generation**: Analyze trends and data to create novel research questions
- **Experimentation**: Provision sandboxed environments for controlled testing
- **Knowledge Creation**: Generate academic papers and integrate findings into knowledge base

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

This project is licensed under the AZORA PROPRIETARY LICENSE - see the LICENSE file for details.

## Support

For support, please contact the Azora ES development team or create an issue in the project repository.