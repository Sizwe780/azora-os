# Automated Compliance Reporting System

Generates periodic compliance reports, audit trails, and regulatory filings for the Azora OS ecosystem.

## Overview

The Automated Compliance Reporting System provides comprehensive reporting capabilities across all regulatory frameworks:

- **Daily Compliance Snapshots**: Real-time compliance status reports
- **Weekly Comprehensive Reports**: Detailed analysis with recommendations
- **Monthly Regulatory Filings**: Formal submissions to regulatory bodies
- **Quarterly Executive Summaries**: High-level compliance overviews
- **Annual Compliance Certifications**: Complete annual compliance documentation

## Features

- **Automated Report Generation**: Scheduled report creation in multiple formats (JSON, PDF, XLSX)
- **Regulatory Filing Preparation**: Automated preparation of regulatory submissions
- **Audit Trail Management**: Collection and storage of compliance audit data
- **Notification System**: Automated notifications to stakeholders
- **Multi-format Output**: Reports generated in JSON, PDF, and spreadsheet formats
- **Retention Management**: Automatic cleanup of old reports based on regulatory requirements

## Supported Frameworks

- **GDPR** (EU General Data Protection Regulation)
- **HIPAA** (US Health Insurance Portability and Accountability Act)
- **SOX** (US Sarbanes-Oxley Act)
- **CCPA** (California Consumer Privacy Act)
- **PIPEDA** (Personal Information Protection and Electronic Documents Act)
- **LGPD** (Lei Geral de Proteção de Dados - Brazilian GDPR)

## Report Types

### Daily Reports
- Generated at 6:00 AM daily
- JSON and PDF formats
- 90-day retention
- Focus: Current compliance status snapshot

### Weekly Reports
- Generated every Monday at 9:00 AM
- JSON, PDF, and XLSX formats
- 365-day retention
- Focus: Comprehensive analysis with trends

### Monthly Reports
- Generated on the 1st of each month at 10:00 AM
- JSON, PDF, and XLSX formats
- 7-year retention
- Focus: Regulatory compliance assessment

### Quarterly Reports
- Generated on the 1st of Q1/Q2/Q3/Q4 at 2:00 PM
- JSON, PDF, and XLSX formats
- 7-year retention
- Focus: Executive-level summaries

### Annual Reports
- Generated on January 1st at 8:00 AM
- JSON, PDF, and XLSX formats
- 7-year retention
- Focus: Complete annual compliance certification

## API Endpoints

### Health Check
```
GET /health
```

### Manual Report Generation
```
POST /api/reports/generate
Content-Type: application/json

{
  "type": "weekly",
  "period": "2024-W01"
}
```

### List Reports
```
GET /api/reports?type=weekly&limit=50
```

### Get Specific Report
```
GET /api/reports/:reportId
```

### Download Report
```
GET /api/reports/:reportId/download/:format
```

### Regulatory Filings
```
GET /api/filings
POST /api/filings/:filingId/submit
```

### Audit Trails
```
GET /api/audit/:framework?startDate=2024-01-01&endDate=2024-01-31
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTOMATED_REPORTING_PORT` | `4087` | Service port |
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
docker build -t azora/automated-reporting .

# Run the container
docker run -p 4087:4087 azora/automated-reporting
```

## Testing

```bash
# Run comprehensive test suite
npm test
```

## Architecture

### Report Generator
- Collects data from all compliance framework services
- Aggregates dashboard metrics
- Generates reports in multiple formats
- Applies retention policies

### Regulatory Filing System
- Prepares formal regulatory submissions
- Tracks filing deadlines and status
- Manages compliance assessments
- Handles submission confirmations

### Audit Trail Manager
- Collects audit data from framework services
- Maintains historical compliance records
- Provides audit trail queries and exports
- Manages data retention

### Notification System
- Sends automated notifications to stakeholders
- Supports multiple notification channels
- Configurable recipient lists per report type

## Scheduled Tasks

The system runs automated tasks using cron scheduling:

- **Daily Reports**: 6:00 AM daily
- **Weekly Reports**: 9:00 AM Mondays
- **Monthly Reports**: 10:00 AM on the 1st
- **Quarterly Reports**: 2:00 PM on quarter starts
- **Annual Reports**: 8:00 AM January 1st
- **Audit Collection**: 2:00 AM daily

## Security

- Secure file handling for report generation
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure audit trail storage
- Regulatory compliance in data handling

## Dependencies

- `express`: Web framework
- `cors`: Cross-origin resource sharing
- `helmet`: Security middleware
- `express-rate-limit`: Rate limiting
- `node-cron`: Scheduled task management
- `pdfkit`: PDF generation
- `xlsx`: Spreadsheet generation
- `archiver`: File archiving
- `dotenv`: Environment variable management

## File Structure

```
reports/
├── daily/
├── weekly/
├── monthly/
├── quarterly/
└── annual/
```

Reports are automatically organized by type and cleaned up based on retention policies.