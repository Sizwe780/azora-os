# Azora Mint - Neural Credit Protocol Service

Azora Mint is the AI-driven micro-credit protocol component of the Azora ES, implementing the "Anti-Bank" system that provides liquidity services to users based on their provable value creation and trust scores. This service implements Article VIII.6 of the Azora Constitution.

## Features

- **AI-Driven Credit Analysis**: Machine learning assessment of creditworthiness based on trust scores
- **Micro-Credit Issuance**: Small loans (R100-R5,000) with 3-month terms
- **Collateral Protocol**: 120% collateralization using AZR tokens
- **Metabolic Tax**: 20% protocol fee that funds the Development Fund
- **Autonomous Collection**: Smart contract-based debt collection
- **Trust Score System**: Multi-factor assessment of user reliability
- **Constitution Compliance**: Fully compliant with Azora's economic framework

## Architecture

### Core Components

- **Express.js Server**: RESTful API with comprehensive middleware
- **MongoDB**: Document database for credit applications, loans, and trust scores
- **AI Integration**: External AI service for credit risk assessment
- **Blockchain Integration**: Smart contract interaction for collateral management
- **Cron Scheduler**: Automated trust score updates and loan management
- **Prometheus Metrics**: Comprehensive monitoring and observability

### Key Models

- **CreditApplication**: User applications with AI analysis results
- **Loan**: Active loan records with repayment schedules
- **TrustScore**: Multi-factor user reliability assessment
- **RepaymentTransaction**: Payment processing and history

## Constitution Compliance

This service implements Article VIII.6 of the Azora Constitution:

> A "Neural Cluster" shall be established on mint.azora.world to autonomously issue micro-credit to users. This is not a "bank"; it is a protocol.

### Key Principles

- **Trust Score Based**: Credit decisions based on provable user behavior
- **Metabolic Tax**: 20% fee reinvested in the ecosystem
- **3-Month Maximum Term**: Rapid loan cycle for ecosystem liquidity
- **120% Collateral**: Full security before disbursement
- **Autonomous Collection**: Smart contract enforcement
- **15% Default Penalty**: Immune response to bad debt

## API Endpoints

### Credit Applications
- `POST /api/credit/apply` - Apply for micro-credit
- `GET /api/credit/applications` - Get user's applications
- `POST /api/credit/approve/{id}` - Approve application (AI/Admin)
- `POST /api/credit/reject/{id}` - Reject application (AI/Admin)

### Trust Scores
- `GET /api/trust/score` - Get user's trust score
- `POST /api/trust/calculate` - Force recalculate score
- `GET /api/trust/leaderboard` - Trust score leaderboard
- `GET /api/trust/stats` - System-wide statistics

### Loans & Repayment
- `GET /api/credit/loans` - Get user's active loans
- `POST /api/repayment/pay` - Make loan payment
- `GET /api/repayment/schedule/{loanId}` - Get repayment schedule
- `GET /api/repayment/history` - Get payment history

### Health & Monitoring
- `GET /api/health` - Basic health check
- `GET /api/health/ready` - Readiness check
- `GET /api/health/metrics` - Prometheus metrics
- `GET /api/health/stats` - Service statistics
- `GET /api/health/constitution` - Constitution compliance

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
   curl http://localhost:3006/api/health
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3006` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/azora-mint` |
| `JWT_SECRET` | JWT signing secret | Required |
| `AI_SERVICE_URL` | AI analysis service URL | `http://localhost:3007` |
| `BLOCKCHAIN_SERVICE_URL` | Blockchain service URL | `http://localhost:3002` |
| `NODE_ENV` | Environment mode | `development` |

### Constitution Parameters

The service is configured with constitutional parameters:
- **Metabolic Tax**: 20% protocol fee
- **Default Penalty**: 15% additional penalty
- **Maximum Term**: 3 months
- **Minimum Trust Score**: 70 for eligibility
- **Observation Phase**: 30 days before activation

## Trust Score Calculation

Trust scores are calculated based on five factors:

1. **System Use (25%)**: Activity in Azora Learn and marketplace
2. **Code Compliance (15%)**: Quality of code submissions
3. **Social Ledger (20%)**: Pod participation and community engagement
4. **Repayment History (20%)**: Past loan repayment record
5. **Value Creation (20%)**: Bounties completed and contributions

Scores range from 0-100 and are updated daily.

## Loan Process

### Application
1. User applies with amount and purpose
2. System calculates trust score
3. AI analyzes risk and recommends amount
4. Application auto-approves if confidence > 80%

### Approval & Disbursement
1. 120% AZR collateral locked on blockchain
2. Funds disbursed to user's bank account
3. Loan becomes active with 3-month term

### Repayment
1. Monthly payments via manual or autonomous collection
2. 20% metabolic tax paid to Development Fund
3. Collateral released upon full repayment

### Default Handling
1. 15% penalty applied to outstanding balance
2. Trust score penalized (50% reduction)
3. Autonomous collection attempts
4. Collateral seized if unpaid after grace period

## Security

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using express-validator
- **Authentication**: JWT-based user authentication
- **Authorization**: Trust score and role-based access control
- **Audit Logging**: Complete transaction and decision logging

## Monitoring

### Metrics

- HTTP request metrics (count, duration, status codes)
- Credit application and approval rates
- Loan portfolio metrics (active loans, total value)
- Trust score distribution
- Repayment rates and default statistics

### Health Checks

- **Health**: Basic service availability
- **Readiness**: Database connectivity and dependencies
- **Liveness**: Service liveness for container orchestration
- **Constitution**: Compliance with constitutional requirements

## Development

### Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Automated Tasks

The service runs several cron jobs:
- **Daily (2 AM)**: Update all trust scores
- **Daily (3 AM)**: Expire old applications
- **Daily (4 AM)**: Process overdue payments
- **Daily (5 AM)**: Update loan statuses
- **Monthly (1st)**: Generate reports and maintenance

## Constitution Compliance

### Article VIII.6 Implementation

- ✅ Trust score based credit decisions
- ✅ 20% metabolic tax protocol
- ✅ 3-month maximum loan terms
- ✅ 120% collateral requirement
- ✅ Autonomous collection mechanism
- ✅ 15% default penalty
- ✅ Observation phase before activation

## Contributing

1. Follow the established code style and patterns
2. Add tests for new features
3. Update API documentation
4. Ensure constitution compliance
5. Follow the Azora ES development guidelines

## License

This project is licensed under the AZORA PROPRIETARY LICENSE - see the LICENSE file for details.