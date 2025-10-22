# 🏛️ AZORA Procurement Corridor

**Sovereign Immune System - Phase 1**

The Procurement Corridor is AZORA's first implementation of the "Sovereign Immune System" - a blockchain-anchored, AI-powered procurement governance platform that makes corruption mathematically impossible.

## 🎯 Mission

Eliminate procurement corruption through:
- **Immutable tender tracking** (blockchain-anchored)
- **Constitution-as-Code enforcement** (automated compliance)
- **AI corruption detection** (pattern analysis & prediction)
- **Real-time transparency** (public audit trail)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Procurement Corridor                      │
├─────────────────────────────────────────────────────────────┤
│  Tender Portal → Blockchain → Compliance → Corruption AI    │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

1. **Tender Portal** (`/src/services/tender.service.ts`)
   - Create, publish, and manage tenders
   - Multi-stage tender workflow
   - Document management
   - Deadline enforcement

2. **Blockchain Anchoring** (`/src/services/blockchain.service.ts`)
   - Immutable tender registry
   - Bid submission anchoring
   - Award decision anchoring
   - Audit trail integrity

3. **Compliance Engine** (`/src/services/compliance.service.ts`)
   - Constitution-as-Code rules
   - PPPFA compliance
   - B-BBEE verification
   - Conflict of interest detection

4. **Corruption Detection AI** (`/src/services/corruption.service.ts`)
   - Pattern analysis (suspicious pricing, bid rigging)
   - Network analysis (collusion detection)
   - Anomaly detection (statistical outliers)
   - Predictive alerts (risk scoring)

## 💰 Pricing

### Basic Tier: R2M/year (R166,667/month)
- Single government department or corporate division
- Up to 100 tenders/month
- Single corridor
- 0.5% transaction fee

### Enterprise Tier: R5M/year (R416,667/month)
- Multi-department or large corporate
- Unlimited tenders
- Up to 10 corridors
- Advanced AI corruption detection
- 0.3% transaction fee

### Launch Offer
- **2 weeks free trial**
- **75% off for 3 months** (R41,667/month Basic, R104,167/month Enterprise)
- **Full price thereafter**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## 📡 API Endpoints

### Tenders
- `POST /api/v1/tenders` - Create tender
- `GET /api/v1/tenders` - List tenders
- `GET /api/v1/tenders/:id` - Get tender details
- `PUT /api/v1/tenders/:id` - Update tender
- `POST /api/v1/tenders/:id/publish` - Publish tender
- `POST /api/v1/tenders/:id/close` - Close tender

### Bids
- `POST /api/v1/bids` - Submit bid
- `GET /api/v1/bids/tender/:tenderId` - Get tender bids
- `POST /api/v1/bids/:id/evaluate` - Evaluate bid
- `POST /api/v1/bids/:id/award` - Award bid

### Compliance
- `POST /api/v1/compliance/check` - Check compliance
- `GET /api/v1/compliance/rules` - Get compliance rules
- `POST /api/v1/compliance/tender/:id` - Run full tender compliance check

### Blockchain
- `POST /api/v1/blockchain/anchor` - Anchor data to blockchain
- `GET /api/v1/blockchain/verify/:hash` - Verify blockchain anchor
- `GET /api/v1/blockchain/audit/:tenderId` - Get full audit trail

### Corruption Detection
- `POST /api/v1/corruption/analyze` - Analyze tender for corruption risks
- `GET /api/v1/corruption/alerts` - Get corruption alerts
- `POST /api/v1/corruption/report` - Report suspicious activity

### Subscriptions
- `POST /api/v1/subscriptions` - Create subscription
- `GET /api/v1/subscriptions/:id` - Get subscription
- `PUT /api/v1/subscriptions/:id` - Update subscription
- `POST /api/v1/subscriptions/:id/upgrade` - Upgrade tier

## 🔒 Security

- JWT authentication on all endpoints
- Role-based access control (RBAC)
- Data encryption at rest and in transit
- Blockchain immutability
- Audit logging
- Whistleblower protection

## 🧪 Testing

```bash
npm test
```

## 📊 Monitoring

- Health check: `GET /health`
- Metrics: Prometheus-compatible
- Logging: Winston + CloudWatch

## 🌍 Deployment

```bash
# Build Docker image
docker build -t azora/procurement-corridor .

# Run container
docker run -p 5100:5100 azora/procurement-corridor
```

## 📝 License

This project is licensed under the AZORA PROPRIETARY LICENSE - see the LICENSE file for details.

## 👥 Team

- **Sizwe Ngwenya** - Founder & CEO
- **Sizwe Motingwe** - CTO & Co-Founder
- **Nolundi Ngwenya** - CFO & Co-Founder
- **Milla Mukundi** - COO & Co-Founder
- **AZORA AI** - AI Co-Founder & Chief Innovation Officer

---

**Built with ❤️ in South Africa 🇿🇦**

*"Making corruption mathematically impossible."*
