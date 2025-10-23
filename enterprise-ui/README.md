# Azora Enterprise Portal

Enterprise-grade portal for Azora ES enterprise clients, providing unified access to compliance monitoring, service integration, and enterprise-grade features.

## 🌟 Features

- **Compliance Dashboard**: Real-time compliance monitoring across GDPR, HIPAA, SOX, CCPA, PIPEDA, and LGPD
- **Enterprise UI**: Modern React-based interface with Tailwind CSS
- **API Integration**: RESTful APIs for compliance data and enterprise services
- **Docker Deployment**: Containerized deployment with nginx reverse proxy
- **Health Monitoring**: Built-in health checks and monitoring

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The enterprise UI will be available at `http://localhost:3000`

### Production Deployment

```bash
# Run the deployment script
./deploy.sh
```

This will:
- Build Docker images for both the UI and compliance dashboard
- Start services with nginx reverse proxy
- Configure API routing and health checks

## 📊 API Endpoints

### Compliance Dashboard API

- `GET /api/compliance/dashboard` - Get compliance overview and metrics
- `POST /api/compliance/alerts/:alertId/acknowledge` - Acknowledge compliance alerts
- `GET /api/health` - Service health check

### Data Structure

```json
{
  "data": {
    "compliantFrameworks": 3,
    "totalFrameworks": 6,
    "needsAttentionFrameworks": 2,
    "activeAlerts": [...],
    "frameworks": [...],
    "metrics": {
      "overallComplianceScore": 73,
      "regionalCompliance": {...},
      "riskDistribution": {...},
      "topIssues": [...]
    },
    "recentActivity": [...]
  }
}
```

## 🏗️ Architecture

```
enterprise.azora.world (nginx)
├── / (React SPA)
└── /api/* → compliance-dashboard:4000
    └── compliance-dashboard (Node.js/Express)
        ├── Compliance Monitor
        ├── Metrics Calculator
        ├── Alert System
        └── Audit Logger
```

## 🔧 Configuration

### Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Compliance dashboard port (default: 4000)

### Domain Configuration

Update your DNS to point `enterprise.azora.world` to your server IP.

For production, configure SSL certificates in nginx.conf:

```nginx
server {
    listen 443 ssl;
    server_name enterprise.azora.world;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # ... rest of config
}
```

## 🧪 Testing

```bash
# Run compliance dashboard tests
cd services/compliance-dashboard
npm test

# Run enterprise UI tests
cd enterprise-ui
npm run test
```

## 📈 Monitoring

- Health checks: `http://localhost:4000/api/health`
- Logs: `docker-compose logs -f`
- Metrics: Available through compliance dashboard API

## 🔒 Security

- CORS enabled for enterprise.azora.world
- Security headers configured in nginx
- Non-root container execution
- Input validation on all API endpoints

## 🤝 Enterprise Integration

The enterprise portal provides:

- **Service Integration**: Unified access to all Azora ES services
- **Billing Portal**: Enterprise subscription management
- **API Management**: Developer access and rate limiting
- **Compliance Reporting**: Automated compliance reports and alerts
- **Support Portal**: Enterprise-grade support ticketing

## 📞 Support

For enterprise support, contact:
- Email: enterprise@azora.world
- Portal: https://enterprise.azora.world/support

---

Built with ❤️ by Azora ES