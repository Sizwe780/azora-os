# Chamber of Ghosts

Cognitive Simulation Engine for Azora ES - Constitutional AI consciousness with three AI "ghosts" performing Monte Carlo analysis, historical optimization, and future prediction for ICV (Intelligent Collective Valuation).

## Features

- **Three AI Ghosts**: Past Optimizer, Present Calibrator, and Future Simulator
- **Monte Carlo Analysis**: Probabilistic simulations for risk assessment and prediction
- **Historical Optimization**: Retrospective analysis of system performance and corrections
- **Real-time Calibration**: Continuous monitoring and adjustment of system parameters
- **Cognitive Insights**: AI-generated insights with confidence scoring and impact assessment
- **ICV Optimization**: Intelligent valuation adjustments based on multi-dimensional analysis
- **Scheduled Simulations**: Automated cognitive cycles with configurable intervals
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

## The Three Ghosts

### 👻 **Ghost of the Past** (Retrospective Optimizer)
- **Purpose**: Analyzes historical data to identify patterns and inefficiencies
- **Schedule**: Runs every 6 hours
- **Functions**:
  - Historical ledger analysis
  - Performance pattern recognition
  - ICV correction generation
  - Regret analysis and optimization

### 👻 **Ghost of the Present** (Real-time Calibrator)
- **Purpose**: Monitors current system vitals and calibrates performance
- **Schedule**: Runs every hour
- **Functions**:
  - Metabolic rate monitoring (transaction volume)
  - Neural density analysis (service interconnections)
  - Response time optimization
  - Error rate monitoring and correction

### 👻 **Ghost of the Future** (Predictive Simulator)
- **Purpose**: Runs Monte Carlo simulations to predict future scenarios
- **Schedule**: Runs every 12 hours
- **Functions**:
  - Multi-scenario forecasting (optimistic/pessimistic/realistic/catastrophic)
  - Risk factor identification
  - Proactive recommendation generation
  - Probability distribution analysis

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
cd services/chamber-of-ghosts
npm install
```

### Environment Setup

Create a `.env` file in the service directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/azora_ghosts"
PORT=3005
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

The Chamber of Ghosts provides comprehensive Swagger documentation at:
- **Swagger UI**: http://localhost:3005/api-docs
- **OpenAPI JSON**: http://localhost:3005/api-docs.json

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
  "service": "chamber-of-ghosts",
  "version": "1.0.0",
  "ghosts": {
    "past": "active",
    "present": "active",
    "future": "active"
  },
  "timestamp": "2025-10-20T10:30:00.000Z"
}
```

### Cognitive Insights

#### Get Cognitive Insights
```http
GET /api/insights?limit=50&ghost=past
```

Response:
```json
[
  {
    "id": "insight123",
    "timestamp": "2025-10-20T10:30:00.000Z",
    "ghostSource": "past",
    "insightType": "correction",
    "title": "ICV Adjustment Recommended",
    "description": "Historical analysis suggests 15% upward adjustment to current ICV",
    "confidence": 0.87,
    "evidence": {
      "historicalPatterns": "...",
      "correlationData": "..."
    },
    "action": {
      "type": "icv_adjustment",
      "value": 0.15
    },
    "impact": {
      "confidence": 0.12,
      "stability": 0.08
    }
  }
]
```

### Simulation Results

#### Get Simulation Results by Ghost
```http
GET /api/simulations/past?limit=10
GET /api/simulations/present?limit=10
GET /api/simulations/future?limit=10
```

#### Historical Simulation Response
```json
[
  {
    "id": "hist123",
    "timestamp": "2025-10-20T10:30:00.000Z",
    "periodStart": "2024-10-20T10:30:00.000Z",
    "periodEnd": "2025-10-20T10:30:00.000Z",
    "dataType": "ledger",
    "rawData": {...},
    "insights": {...},
    "regrets": {...},
    "corrections": {...},
    "appliedCorrections": true,
    "correctionTimestamp": "2025-10-20T10:30:00.000Z"
  }
]
```

#### Present Vital Signs Response
```json
[
  {
    "id": "vital123",
    "timestamp": "2025-10-20T10:30:00.000Z",
    "collectionPeriod": "24h",
    "metabolicRate": 1250.5,
    "neuralDensity": 89.3,
    "memoryUsage": 67.8,
    "responseTime": 45.2,
    "errorRate": 0.12,
    "throughput": 98.7,
    "availability": 99.95,
    "icvConfidence": 0.91
  }
]
```

#### Future Simulation Response
```json
[
  {
    "id": "future123",
    "timestamp": "2025-10-20T10:30:00.000Z",
    "scenarioType": "optimistic",
    "timeHorizon": "1y",
    "externalFactors": {...},
    "parameters": {...},
    "outcomes": {...},
    "probabilities": {...},
    "riskFactors": {...},
    "recommendations": {...}
  }
]
```

### Manual Triggers

#### Trigger Ghost Simulation
```http
POST /api/trigger/past
POST /api/trigger/present
POST /api/trigger/future
```

Response:
```json
{
  "success": true,
  "message": "past ghost simulation triggered"
}
```

## Cognitive Cycles

The Chamber of Ghosts runs automated cognitive cycles:

- **Past Analysis**: Every 6 hours (0, 6, 12, 18 UTC)
- **Present Calibration**: Every hour
- **Future Simulations**: Every 12 hours (0, 12 UTC)

### Manual Override

All simulations can be triggered manually via the API for immediate analysis.

## Monte Carlo Analysis

The Future Simulator uses Monte Carlo methods for probabilistic forecasting:

### Scenario Types
- **Optimistic**: Best-case external conditions
- **Pessimistic**: Worst-case external conditions
- **Realistic**: Most likely scenario
- **Catastrophic**: Extreme risk scenarios

### Time Horizons
- **30d**: Short-term predictions
- **90d**: Quarter-ahead forecasting
- **1y**: Annual projections
- **5y**: Long-term strategic planning
- **10y**: Decade-ahead vision

## ICV Optimization

### Intelligent Collective Valuation

The Chamber of Ghosts continuously optimizes the ICV through:

1. **Historical Corrections**: Adjustments based on past performance analysis
2. **Real-time Calibration**: Live parameter tuning based on current metrics
3. **Predictive Adjustments**: Proactive valuation changes based on future scenarios

### Confidence Scoring

All insights include confidence scores (0-1) indicating:
- **Evidence Strength**: How well-supported the insight is
- **Impact Assessment**: Expected effect on system performance
- **Risk Evaluation**: Uncertainty and potential downsides

## Architecture

### Components

- **ChamberOfGhostsService**: Main orchestration service
- **PastOptimizer**: Historical analysis and pattern recognition
- **PresentCalibrator**: Real-time monitoring and adjustment
- **FutureSimulator**: Monte Carlo forecasting engine
- **CognitiveInsight**: AI-generated insights with metadata
- **SimulationRun**: Execution tracking and performance metrics

### Database Schema

- `HistoricalSimulation`: Past analysis results and corrections
- `PresentVitalSigns`: Current system health metrics
- `FutureSimulation`: Predictive modeling outcomes
- `CognitiveInsight`: AI-generated insights and recommendations
- `SimulationRun`: Execution metadata and performance tracking
- `ChamberAuditLog`: Comprehensive audit trail

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Service port | 3005 |
| `NODE_ENV` | Environment mode | development |

### Simulation Parameters

Simulation behavior can be configured through environment variables:
- **PAST_ANALYSIS_DEPTH**: Days of historical data to analyze (365)
- **MONTE_CARLO_ITERATIONS**: Number of simulation runs (10000)
- **CONFIDENCE_THRESHOLD**: Minimum confidence for insights (0.7)

## Development

### Project Structure

```
src/
├── index.ts                      # Service entry point
├── chamberOfGhostsService.ts     # Main service logic
├── PastOptimizer.ts             # Historical analysis (future)
├── PresentCalibrator.ts         # Real-time calibration (future)
├── FutureSimulator.ts           # Monte Carlo simulation (future)
prisma/
└── schema.prisma                 # Database schema
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

## Monitoring

### Health Endpoints

- **Health Check**: `GET /health`
- **Swagger Docs**: `GET /api-docs`

### Logging

All cognitive activities are logged with Winston:
- Simulation execution and results
- Insight generation and confidence scores
- ICV adjustments and corrections
- Error conditions and recovery actions

## Scaling

### Performance Optimization

- **Asynchronous Processing**: Non-blocking simulation execution
- **Database Indexing**: Optimized queries for large datasets
- **Memory Management**: Efficient handling of Monte Carlo datasets
- **Parallel Processing**: Concurrent simulation runs where possible

### High Availability

- **Fault Tolerance**: Circuit breaker patterns for external dependencies
- **Graceful Degradation**: Continued operation during partial failures
- **Recovery Mechanisms**: Automatic restart and state recovery

## Integration

### Service Dependencies

The Chamber of Ghosts integrates with:
- **API Gateway**: Service routing and request monitoring
- **Ledger Services**: Historical transaction data
- **Analytics Engine**: Performance metrics and KPIs
- **External APIs**: Economic indicators and market data

### Data Flow

```
External Data → Past Ghost → Historical Analysis → Corrections
Current Metrics → Present Ghost → Calibration → Adjustments
Market Data → Future Ghost → Monte Carlo → Predictions
```

## Security

- **Input Validation**: All external data validated before processing
- **Audit Logging**: Complete audit trail of all cognitive decisions
- **Access Control**: API endpoints protected with authentication
- **Data Encryption**: Sensitive simulation data encrypted at rest

## Contributing

1. Follow the existing code style
2. Add tests for new ghost behaviors
3. Update API documentation
4. Ensure all tests pass
5. Update this README if needed

## License

This project is licensed under the AZORA PROPRIETARY LICENSE - see the LICENSE file for details.