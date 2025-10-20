# Compliance Monitoring Dashboard

A unified dashboard for monitoring compliance across all regulatory frameworks in the Azora OS ecosystem.

## Overview

The Compliance Monitoring Dashboard provides centralized oversight of compliance status across multiple international regulatory frameworks:

- **GDPR** (EU General Data Protection Regulation)
- **HIPAA** (US Health Insurance Portability and Accountability Act)
- **SOX** (US Sarbanes-Oxley Act)
- **CCPA** (California Consumer Privacy Act)
- **PIPEDA** (Personal Information Protection and Electronic Documents Act)
- **LGPD** (Lei Geral de Proteção de Dados - Brazilian GDPR)

## Features

- **Real-time Monitoring**: Automated status polling from all compliance services
- **Alert Generation**: Critical compliance alerts with severity levels
- **Metrics Calculation**: Global compliance scores and regional breakdowns
- **Risk Assessment**: Automated risk distribution analysis
- **Audit Trails**: Cross-framework audit logging
- **Reporting**: Automated compliance report generation
- **Notification System**: Email/SMS notifications for compliance events

## API Endpoints

### Health Check
```
GET /health
```

### Dashboard Overview
```
GET /dashboard
```
Returns comprehensive compliance overview with metrics, alerts, and recent activity.

### Framework Status
```
GET /dashboard/framework/:framework
```
Get detailed status for a specific compliance framework.

### Alerts Management
```
GET /dashboard/alerts
POST /dashboard/alerts/:alertId/acknowledge
```

### Compliance Reporting
```
POST /dashboard/reports
GET /dashboard/reports
GET /dashboard/reports/:reportId
```

### Audit Trail
```
GET /dashboard/audit
```

### Manual Refresh
```
POST /dashboard/refresh
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `COMPLIANCE_DASHBOARD_PORT` | `4086` | Service port |
| `GDPR_COMPLIANCE_PORT` | `4080` | GDPR service port |
| `HIPAA_COMPLIANCE_PORT` | `4081` | HIPAA service port |
| `SOX_COMPLIANCE_PORT` | `4082` | SOX service port |
| `CCPA_COMPLIANCE_PORT` | `4083` | CCPA service port |
| `PIPEDA_COMPLIANCE_PORT` | `4084` | PIPEDA service port |
| `LGPD_COMPLIANCE_PORT` | `4085` | LGPD service port |

## Running Locally

```bash
# Install dependencies
npm install

# Start the service
npm start

# Development mode with auto-restart
npm run dev
```

## Docker

```bash
# Build the image
docker build -t azora/compliance-dashboard .

# Run the container
docker run -p 4086:4086 azora/compliance-dashboard
```

## Testing

```bash
# Run unit tests
npm test
```

## Architecture

The dashboard operates as a central aggregator that:

1. **Polls Framework Services**: Regularly fetches status from each compliance service
2. **Aggregates Data**: Combines framework data into global metrics
3. **Generates Alerts**: Creates alerts based on compliance status changes
4. **Maintains Audit Trail**: Logs all compliance-related activities
5. **Provides Reporting**: Generates periodic compliance reports

## Security

- Helmet.js for security headers
- CORS protection
- Rate limiting on dashboard endpoints
- Input validation and sanitization
- Secure audit logging

## Monitoring

The service includes comprehensive monitoring:

- Health checks every 30 seconds
- Automatic service discovery
- Error handling and recovery
- Performance metrics collection
- Automated alerting for service issues

## Dependencies

- `express`: Web framework
- `cors`: Cross-origin resource sharing
- `helmet`: Security middleware
- `express-rate-limit`: Rate limiting
- `dotenv`: Environment variable management