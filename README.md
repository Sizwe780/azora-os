# Azora OS — Constitutional AI for Planetary Economic Intelligence

**Azora OS** is a planetary-scale economic intelligence platform that combines constitutional AI, biological systems architecture, and sovereign economic coordination to create universal prosperity through knowledge-driven economic sovereignty.

[![License: AZORA PROPRIETARY](https://img.shields.io/badge/License-AZORA%20PROPRIETARY-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)](https://nextjs.org/)

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [🏗️ System Architecture](#️-system-architecture)
- [🚀 Quick Start](#-quick-start)
- [📋 API Endpoints](#-api-endpoints)
- [🌍 Global Genesis Mandate](#-global-genesis-mandate)
- [🎓 Azora Sapiens - Education Platform](#-azora-sapiens---education-platform)
- [💰 Azora Mint - Economic Engine](#-azora-mint---economic-engine)
- [🔮 Azora Oracle - Intelligence Oracle](#-azora-oracle---intelligence-oracle)
- [🐳 Docker Deployment](#-docker-deployment)
- [🔒 Security & Compliance](#-security--compliance)
- [📊 Monitoring & Analytics](#-monitoring--analytics)
- [🚀 Development & Testing](#-development--testing)
- [🌟 Enterprise Impact](#-enterprise-impact)
- [📞 Contact & Support](#-contact--support)

## 🌟 Overview

Azora OS represents the next evolution of economic intelligence, featuring:

- **Planetary Scale**: Sovereign economic instantiation across 195 nations
- **Education Economics**: Transform education from cost to paid value creation
- **Constitutional AI**: Ethical AI governance for economic decision-making
- **Cryptographic Sovereignty**: Secure, private economic coordination
- **Universal Prosperity**: Knowledge-driven economic abundance for all

**Current Status**: Planetary economic coordination platform ready for deployment
**Next Milestone**: Execute Global Genesis Protocol for sovereign economy instantiation
**Vision**: Universal prosperity through knowledge-driven economic sovereignty

## 🏗️ System Architecture

### Core Services

Azora OS features a complete microservices architecture with autonomous AI capabilities:

#### Planetary Services
- **Aegis Citadel** (`:4099`) - Global Genesis Command & sovereign fund management
- **Azora Sapiens** (`:4200`) - Universal education platform with Aegis integrity monitoring
- **Azora Mint** (`:4300`) - Economic engine with Proof-of-Knowledge rewards
- **Azora Oracle** (`:4030`) - Planetary intelligence oracle with real-time exchange rates

#### Supporting Services
- **Azora Nexus** - Anomaly detection and system monitoring
- **Azora Covenant** - Blockchain integration and smart contracts
- **Azora Forge** - Merchant tools and marketplace integration
- **Azora Scriptorum** - Knowledge ingestion and processing

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js 22+, Express.js, TypeScript
- **Database**: PostgreSQL with pgvector, Redis for caching
- **AI/ML**: OpenAI integration, LangChain, custom constitutional AI
- **Infrastructure**: Docker, Kubernetes, multi-cloud deployment
- **Security**: Zero-trust architecture, cryptographic sovereignty

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- PostgreSQL & Redis (or use Docker)

### Local Development Setup

1. **Clone and setup:**
   ```bash
   git clone https://github.com/Sizwe780/azora-os
   cd azora-os
   npm install
   ```

2. **Start infrastructure:**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d postgres redis

   # Initialize databases
   npm run db:init
   ```

3. **Launch planetary services:**
   ```bash
   # Start Aegis Citadel (Global Genesis Command)
   cd azora-aegis && npm start

   # Start Azora Sapiens (Education Platform)
   cd ../azora-sapiens && npm start

   # Start Azora Mint (Economic Engine)
   cd ../azora-mint && npm start

   # Start Azora Oracle (Intelligence Oracle)
   cd ../azora-oracle && npm start
   ```

4. **Verify planetary deployment:**
   ```bash
   # Check Aegis Citadel status
   curl http://localhost:4099/api/citadel/genesis/status

   # Check education platform
   curl http://localhost:4200/health

   # Check economic engine
   curl http://localhost:4300/api/ubo/status
   ```

## 📋 API Endpoints

### Aegis Citadel - Global Genesis
```
GET    /api/citadel/genesis/status     - Global fund and nation status
GET    /api/citadel/grants/:country    - Sovereign seed grant details
POST   /api/citadel/triggers/check     - Check activation triggers
POST   /api/citadel/instantiate/:country - Execute instantiation protocol
GET    /api/citadel/economies          - Instantiated economies
GET    /health                         - Citadel health status
```

### Azora Sapiens - Education Platform
```
GET    /api/programs                   - Available CKQ programs
POST   /api/enroll                     - Enroll in CKQ program
GET    /api/enrollments/:userId        - User enrollment history
POST   /api/module/complete            - Complete module (triggers rewards)
POST   /api/exam/start                 - Start Aegis-protected exam
POST   /api/exam/submit                - Submit exam for grading
GET    /api/knowledge-graph/status     - Ascension Protocol progress
GET    /health                         - Education platform health
```

### Azora Mint - Economic Engine
```
GET    /api/health                     - Service health
GET    /api/metrics                    - Economic metrics
POST   /api/knowledge-reward           - Process Proof-of-Knowledge payment
GET    /api/knowledge-rewards/:userId  - User reward history
GET    /api/knowledge-rewards/stats    - Global reward statistics
GET    /api/ubo/status                 - UBO fund status
```

### Azora Oracle - Intelligence Oracle
```
GET    /api/rates                      - Current exchange rates
GET    /api/rates/:from/:to            - Specific rate pairs
GET    /api/ascension/ingestion/status - Knowledge ingestion progress
POST   /api/ascension/ingestion/start  - Start knowledge ingestion
GET    /api/ascension/knowledge/search - Search knowledge graph
GET    /health                         - Oracle health status
WS     ws://localhost:4030             - Real-time rate streaming
```

## 🌍 Global Genesis Mandate

### Phase 1: Sovereign Seed Grants ✅ READY
- **Fund Size**: 195,000,000 AZR allocated
- **Grant Amount**: 1,000,000 AZR per nation
- **Coverage**: 193 UN-recognized nations
- **Status**: Escrowed and ready for activation

### Phase 2: Critical Mass Events ✅ READY
- **User Threshold**: 10,000+ Global Transfer app users
- **University Treaty**: Signed Protocol-University Treaty
- **Founding Team**: Local team petitions The Council

### Phase 3: Instantiation Protocol ✅ READY
- **Brazil**: Ready for instantiation (aBRL token)
- **Kenya**: Ready for instantiation (aUSD token)
- **Remaining Nations**: 193 ready for activation

### Phase 4: Proof-of-Knowledge Protocol ✅ READY
- **UBO Fund**: 10,000,000 aZAR allocated (1% of supply)
- **Reward Categories**: Module completion, assessments, certifications
- **Payment Triggers**: Automatic instant rewards for learning milestones
- **Economic Impact**: Education transformed into paid value creation

## 🎓 Azora Sapiens - Education Platform

### CKQ Programs Available
- **Solar Grid Technician**: Photovoltaic systems, electrical safety, maintenance
- **Hydroponic Farm Operator**: System design, nutrient management, optimization
- **Smart Contract Auditing**: Solidity fundamentals, vulnerability assessment

### Aegis Mobile Sentry
- **Device Lockdown**: Automatic smartphone security protocols
- **AI Anomaly Detection**: Real-time integrity monitoring
- **Camera/Microphone**: Continuous environmental scanning
- **Instant Termination**: Security violation triggers immediate exam termination

### Proof-of-Knowledge Rewards
- **Module Completion**: 100-200 aZAR based on difficulty
- **Assessment Pass**: 300-500 aZAR for practical/theoretical exams
- **Certification**: 1,000-2,000 aZAR for full CKQ completion
- **Milestones**: Bonus rewards for progress achievements

## 💰 Azora Mint - Economic Engine

### Universal Basic Opportunity (UBO) Fund
- **Allocation**: 1% of total aZAR supply
- **Purpose**: Knowledge reward payments
- **Distribution**: Instant, automatic payouts
- **Economic Theory**: Monetize learning, create knowledge economy

### Multi-Currency Support
- **AZR**: Global reserve and settlement currency
- **aZAR**: South African sovereign currency (pegged to ZAR)
- **aBRL**: Brazilian sovereign currency (pegged to BRL)
- **aUSD**: Kenyan sovereign currency (pegged to USD)

### Economic Intelligence
- **Real-time Metrics**: GDP, velocity, transaction volume
- **UBO Analytics**: Reward distribution and utilization tracking
- **Policy Recommendations**: AI-driven economic optimization

## 🔮 Azora Oracle - Intelligence Oracle

### Exchange Rate Streaming
- **Coverage**: AZR, ZAR, USD, EUR, GBP, and emerging sovereign tokens
- **Update Frequency**: Real-time with 5-second intervals
- **WebSocket Support**: Live streaming for applications
- **Historical Data**: Complete rate history and analytics

### Ascension Protocol - Academic Knowledge
- **Target Universities**: MIT, Stanford, Oxford, Harvard, Cambridge
- **Knowledge Types**: Research papers, textbooks, case studies, lectures
- **Processing Rate**: 45 documents/hour, 280 knowledge nodes/hour
- **Completion**: 23% complete, 15,420 documents processed
- **First Principles**: Deconstruction and superior curriculum synthesis

## 🐳 Docker Deployment

### Single-Container Development
```bash
# Build all services
docker build -t azora-os:latest .

# Run complete platform
docker run -p 4099:4099 -p 4200:4200 -p 4300:4300 -p 4030:4030 azora-os:latest
```

### Multi-Container Production
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: azora
      POSTGRES_USER: azora
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine

  aegis-citadel:
    build: ./azora-aegis
    ports: ["4099:4099"]
    depends_on: [postgres, redis]

  azora-sapiens:
    build: ./azora-sapiens
    ports: ["4200:4200"]
    depends_on: [postgres, redis]

  azora-mint:
    build: ./azora-mint
    ports: ["4300:4300"]
    depends_on: [postgres, redis]

  azora-oracle:
    build: ./azora-oracle
    ports: ["4030:4030"]
    depends_on: [postgres, redis]
```

## 🔒 Security & Compliance

### Zero-Trust Architecture
- **Cryptographic Sovereignty**: End-to-end encryption for all economic operations
- **Constitutional AI**: Ethical constraints on all autonomous decisions
- **Audit Trails**: Complete transaction and decision logging
- **Sovereign Data**: Nation-level data sovereignty and control

### Regulatory Compliance
- **Global Standards**: GDPR, CCPA, POPIA compliance
- **Financial Regulation**: Automated KYC/AML for economic transactions
- **Educational Standards**: International accreditation frameworks
- **Security Audits**: Continuous penetration testing and vulnerability assessment

## 📊 Monitoring & Analytics

### Real-Time Dashboards
- **Aegis Citadel**: Global Genesis Fund status and nation activation tracking
- **Azora Sapiens**: Student progress, Aegis integrity metrics, reward distributions
- **Azora Mint**: Economic indicators, UBO fund utilization, currency flows
- **Azora Oracle**: Exchange rates, knowledge ingestion progress, AI performance

### Health Checks
```bash
# Service health verification
curl http://localhost:4099/health  # Aegis Citadel
curl http://localhost:4200/health  # Azora Sapiens
curl http://localhost:4300/api/health  # Azora Mint
curl http://localhost:4030/health  # Azora Oracle
```

## 🚀 Development & Testing

### Run Test Suite
```bash
# Run all service tests
npm test

# Run specific service tests
cd azora-sapiens && npm test
cd ../azora-mint && npm test
```

### API Testing
```bash
# Test Global Genesis activation
curl -X POST http://localhost:4099/api/citadel/triggers/check \
  -H "Content-Type: application/json" \
  -d '{"country": "South Africa", "triggerType": "userThreshold", "triggerData": {"userCount": 15000}}'

# Test Proof-of-Knowledge reward
curl -X POST http://localhost:4300/api/knowledge-reward \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "rewardType": "module_completion", "rewardCategory": "advanced", "achievement": "Completed Photovoltaic Physics"}'
```

## 🌟 Enterprise Impact

Azora OS represents the next evolution of economic intelligence:

- **Planetary Scale**: Sovereign economic instantiation across 195 nations
- **Education Economics**: Transform education from cost to paid value creation
- **Constitutional AI**: Ethical AI governance for economic decision-making
- **Cryptographic Sovereignty**: Secure, private economic coordination
- **Universal Prosperity**: Knowledge-driven economic abundance for all

**Azora OS — Constitutional AI for Planetary Economic Flourishing**

*Building the future of sovereign prosperity through education and innovation*

## 📞 Contact & Support

- **Enterprise**: enterprise@azora.world
- **Technical Support**: support@azora.world
- **API Documentation**: `/docs/API_DOCUMENTATION.md`
- **Architecture Docs**: `/docs/AZORA-COMPREHENSIVE-ARCHITECTURE.md`

---

**Azora OS — Constitutional AI for Planetary Economic Flourishing**

*Building the future of sovereign prosperity through education and innovation*
- ✅ **Ascension Protocol**: Academic knowledge ingestion and curriculum synthesis ready
- ✅ **Aegis Citadel**: Sovereign seed grant management operational
- ✅ **Azora Sapiens**: Universal education platform with Aegis Mobile Sentry
- ✅ **Azora Mint**: Enhanced with Universal Basic Opportunity (UBO) fund

## 🏗️ **System Architecture**

### **Core Sovereign Services**

#### **Aegis Citadel** (`:4099`) - Global Genesis Command Center
- **Global Genesis Fund**: 195M AZR strategic allocation for planetary seeding
- **Sovereign Seed Grants**: 1M AZR per nation for economic instantiation
- **Activation Triggers**: User thresholds, university treaties, founding teams
- **Instantiation Protocol**: Automated economic sovereignty deployment

#### **Azora Sapiens** (`:4200`) - Universal Education Platform
- **CKQ Programs**: Core Knowledge Qualification certifications
- **Aegis Mobile Sentry**: AI-powered remote exam integrity
- **Proof-of-Knowledge Protocol**: Education-to-earning transformation
- **Ascension Protocol**: First principles curriculum synthesis

#### **Azora Mint** (`:4300`) - Economic Sovereignty Engine
- **Universal Basic Opportunity (UBO) Fund**: 1% allocation for knowledge rewards
- **Proof-of-Knowledge Payments**: Instant aZAR rewards for learning milestones
- **Multi-Currency Support**: AZR, aZAR, and local sovereign tokens
- **Economic Analytics**: Real-time prosperity metrics

#### **Azora Oracle** (`:4030`) - Planetary Intelligence Oracle
- **Global Exchange Rates**: Real-time multi-currency streaming
- **Ascension Protocol**: Academic knowledge graph ingestion
- **WebSocket Streaming**: Live economic intelligence
- **Constitutional Governance**: Ethical AI decision framework

### **Supporting Services**

#### **Azora Nexus** (`:4000`) - Neural Coordination Hub
- **Anomaly Detection**: Real-time economic pattern analysis
- **Intent Processing**: Natural language economic coordination
- **Event Streaming**: Live system intelligence
- **Cross-Service Integration**: Unified economic orchestration

#### **Azora Covenant** (`:4400`) - Blockchain Sovereignty
- **Smart Contracts**: Automated economic agreements
- **Token Standards**: Sovereign currency protocols
- **Decentralized Governance**: Community-driven economic decisions
- **Cross-Chain Bridges**: Multi-network economic connectivity

#### **Azora Aegis** (`:4098`) - Security & Compliance
- **Guardian Service**: Wallet recovery and security protocols
- **KYC/AML**: Regulatory compliance automation
- **Audit Trails**: Complete economic transaction logging
- **Constitutional Enforcement**: Ethical constraint validation

#### **Azora Forge** (`:4500`) - Merchant & Marketplace
- **Merchant Tools**: Business enablement platform
- **Marketplace Integration**: Service discovery and transactions
- **Revenue Optimization**: Automated pricing and yield management
- **Economic Partnerships**: B2B and B2G relationship management

### **Technology Stack**
- **Runtime**: Node.js 22+ with enterprise-grade TypeScript
- **Database**: PostgreSQL with vector extensions for AI memory
- **Cache**: Redis for real-time session and intelligence caching
- **Message Queue**: Built-in event streaming with WebSocket support
- **AI/ML**: Constitutional AI with ethical constraint frameworks
- **Security**: Zero-trust architecture with cryptographic sovereignty
- **Deployment**: Docker containers with Kubernetes orchestration
- **Monitoring**: Real-time health checks and economic intelligence

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 22+
- Docker & Docker Compose
- PostgreSQL & Redis
- Git

### **Local Development Setup**

1. **Clone and initialize:**
   ```bash
   git clone https://github.com/Sizwe780/azora-os
   cd azora-os
   npm install
   ```

2. **Start core infrastructure:**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d postgres redis

   # Initialize databases
   npm run db:init
   ```

3. **Launch planetary services:**
   ```bash
   # Start Aegis Citadel (Global Genesis Command)
   cd azora-aegis && npm start

   # Start Azora Sapiens (Education Platform)
   cd ../azora-sapiens && npm start

   # Start Azora Mint (Economic Engine)
   cd ../azora-mint && npm start

   # Start Azora Oracle (Intelligence Oracle)
   cd ../azora-oracle && npm start
   ```

4. **Verify planetary deployment:**
   ```bash
   # Check Aegis Citadel status
   curl http://localhost:4099/api/citadel/genesis/status

   # Check education platform
   curl http://localhost:4200/health

   # Check economic engine
   curl http://localhost:4300/api/ubo/status
   ```

## 📋 **API Endpoints**

### **Aegis Citadel - Global Genesis**
```
GET    /api/citadel/genesis/status     - Global fund and nation status
GET    /api/citadel/grants/:country    - Sovereign seed grant details
POST   /api/citadel/triggers/check     - Check activation triggers
POST   /api/citadel/instantiate/:country - Execute instantiation protocol
GET    /api/citadel/economies          - Instantiated economies
GET    /health                         - Citadel health status
```

### **Azora Sapiens - Education Platform**
```
GET    /api/programs                   - Available CKQ programs
POST   /api/enroll                     - Enroll in CKQ program
GET    /api/enrollments/:userId        - User enrollment history
POST   /api/module/complete            - Complete module (triggers rewards)
POST   /api/exam/start                 - Start Aegis-protected exam
POST   /api/exam/submit                - Submit exam for grading
GET    /api/knowledge-graph/status     - Ascension Protocol progress
GET    /health                         - Education platform health
```

### **Azora Mint - Economic Engine**
```
GET    /api/health                     - Service health
GET    /api/metrics                    - Economic metrics
POST   /api/knowledge-reward           - Process Proof-of-Knowledge payment
GET    /api/knowledge-rewards/:userId  - User reward history
GET    /api/knowledge-rewards/stats    - Global reward statistics
GET    /api/ubo/status                 - UBO fund status
```

### **Azora Oracle - Intelligence Oracle**
```
GET    /api/rates                      - Current exchange rates
GET    /api/rates/:from/:to            - Specific rate pairs
GET    /api/ascension/ingestion/status - Knowledge ingestion progress
POST   /api/ascension/ingestion/start  - Start knowledge ingestion
GET    /api/ascension/knowledge/search - Search knowledge graph
GET    /health                         - Oracle health status
WS     ws://localhost:4030             - Real-time rate streaming
```

## 🌍 **Global Genesis Mandate - Planetary Deployment**

### **Phase 1: Sovereign Seed Grants** ✅ READY
- **Fund Size**: 195,000,000 AZR allocated
- **Grant Amount**: 1,000,000 AZR per nation
- **Coverage**: 193 UN-recognized nations
- **Status**: Escrowed and ready for activation

### **Phase 2: Critical Mass Events** ✅ READY
- **User Threshold**: 10,000+ Global Transfer app users
- **University Treaty**: Signed Protocol-University Treaty
- **Founding Team**: Local team petitions The Council

### **Phase 3: Instantiation Protocol** ✅ READY
- **Brazil**: Ready for instantiation (aBRL token)
- **Kenya**: Ready for instantiation (aUSD token)
- **Remaining Nations**: 193 ready for activation

### **Phase 4: Proof-of-Knowledge Protocol** ✅ READY
- **UBO Fund**: 10,000,000 aZAR allocated (1% of supply)
- **Reward Categories**: Module completion, assessments, certifications
- **Payment Triggers**: Automatic instant rewards for learning milestones
- **Economic Impact**: Education transformed into paid value creation

## 🎓 **Azora Sapiens - Universal Education**

### **CKQ Programs Available**
- **Solar Grid Technician**: Photovoltaic systems, electrical safety, maintenance
- **Hydroponic Farm Operator**: System design, nutrient management, optimization
- **Smart Contract Auditing**: Solidity fundamentals, vulnerability assessment

### **Aegis Mobile Sentry**
- **Device Lockdown**: Automatic smartphone security protocols
- **AI Anomaly Detection**: Real-time integrity monitoring
- **Camera/Microphone**: Continuous environmental scanning
- **Instant Termination**: Security violation triggers immediate exam termination

### **Proof-of-Knowledge Rewards**
- **Module Completion**: 100-200 aZAR based on difficulty
- **Assessment Pass**: 300-500 aZAR for practical/theoretical exams
- **Certification**: 1,000-2,000 aZAR for full CKQ completion
- **Milestones**: Bonus rewards for progress achievements

## 💰 **Azora Mint - Economic Sovereignty**

### **Universal Basic Opportunity (UBO) Fund**
- **Allocation**: 1% of total aZAR supply
- **Purpose**: Knowledge reward payments
- **Distribution**: Instant, automatic payouts
- **Economic Theory**: Monetize learning, create knowledge economy

### **Multi-Currency Support**
- **AZR**: Global reserve and settlement currency
- **aZAR**: South African sovereign currency (pegged to ZAR)
- **aBRL**: Brazilian sovereign currency (pegged to BRL)
- **aUSD**: Kenyan sovereign currency (pegged to USD)

### **Economic Intelligence**
- **Real-time Metrics**: GDP, velocity, transaction volume
- **UBO Analytics**: Reward distribution and utilization tracking
- **Policy Recommendations**: AI-driven economic optimization

## 🔮 **Azora Oracle - Planetary Intelligence**

### **Exchange Rate Streaming**
- **Coverage**: AZR, ZAR, USD, EUR, GBP, and emerging sovereign tokens
- **Update Frequency**: Real-time with 5-second intervals
- **WebSocket Support**: Live streaming for applications
- **Historical Data**: Complete rate history and analytics

### **Ascension Protocol - Academic Knowledge**
- **Target Universities**: MIT, Stanford, Oxford, Harvard, Cambridge
- **Knowledge Types**: Research papers, textbooks, case studies, lectures
- **Processing Rate**: 45 documents/hour, 280 knowledge nodes/hour
- **Completion**: 23% complete, 15,420 documents processed
- **First Principles**: Deconstruction and superior curriculum synthesis

## 🐳 **Docker Deployment**

### **Single-Container Development**
```bash
# Build all services
docker build -t azora-os:latest .

# Run complete platform
docker run -p 4099:4099 -p 4200:4200 -p 4300:4300 -p 4030:4030 azora-os:latest
```

### **Multi-Container Production**
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: azora
      POSTGRES_USER: azora
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine

  aegis-citadel:
    build: ./azora-aegis
    ports: ["4099:4099"]
    depends_on: [postgres, redis]

  azora-sapiens:
    build: ./azora-sapiens
    ports: ["4200:4200"]
    depends_on: [postgres, redis]

  azora-mint:
    build: ./azora-mint
    ports: ["4300:4300"]
    depends_on: [postgres, redis]

  azora-oracle:
    build: ./azora-oracle
    ports: ["4030:4030"]
    depends_on: [postgres, redis]
```

## 🔒 **Security & Compliance**

### **Zero-Trust Architecture**
- **Cryptographic Sovereignty**: End-to-end encryption for all economic operations
- **Constitutional AI**: Ethical constraints on all autonomous decisions
- **Audit Trails**: Complete transaction and decision logging
- **Sovereign Data**: Nation-level data sovereignty and control

### **Regulatory Compliance**
- **Global Standards**: GDPR, CCPA, POPIA compliance
- **Financial Regulation**: Automated KYC/AML for economic transactions
- **Educational Standards**: International accreditation frameworks
- **Security Audits**: Continuous penetration testing and vulnerability assessment

## 📊 **Monitoring & Analytics**

### **Real-Time Dashboards**
- **Aegis Citadel**: Global Genesis Fund status and nation activation tracking
- **Azora Sapiens**: Student progress, Aegis integrity metrics, reward distributions
- **Azora Mint**: Economic indicators, UBO fund utilization, currency flows
- **Azora Oracle**: Exchange rates, knowledge ingestion progress, AI performance

### **Health Checks**
```bash
# Service health verification
curl http://localhost:4099/health  # Aegis Citadel
curl http://localhost:4200/health  # Azora Sapiens
curl http://localhost:4300/api/health  # Azora Mint
curl http://localhost:4030/health  # Azora Oracle
```

## 🚀 **Development & Testing**

### **Run Test Suite**
```bash
# Run all service tests
npm test

# Run specific service tests
cd azora-sapiens && npm test
cd ../azora-mint && npm test
```

### **API Testing**
```bash
# Test Global Genesis activation
curl -X POST http://localhost:4099/api/citadel/triggers/check \
  -H "Content-Type: application/json" \
  -d '{"country": "South Africa", "triggerType": "userThreshold", "triggerData": {"userCount": 15000}}'

# Test Proof-of-Knowledge reward
curl -X POST http://localhost:4300/api/knowledge-reward \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "rewardType": "module_completion", "rewardCategory": "advanced", "achievement": "Completed Photovoltaic Physics"}'
```

## � **Community & Contribution**

### **Getting Involved**
Azora OS is an open-source project that welcomes contributions from developers, researchers, and economic thinkers worldwide.

- **📖 [Contributing Guide](CONTRIBUTING.md)**: Learn how to contribute code, documentation, and ideas
- **📋 [Code of Conduct](CODE_OF_CONDUCT.md)**: Our community standards and guidelines
- **💡 [Examples](examples/)**: Code examples and usage patterns
- **🔒 [Security](SECURITY.md)**: Security policies and vulnerability reporting

### **Community Resources**
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Join technical discussions and Q&A
- **Documentation**: Comprehensive guides and API references
- **Examples**: Working code samples and integration guides

### **Development Community**
```bash
# Join the development community
- Follow our GitHub repository for updates
- Star the project to show your support
- Watch for releases and announcements
- Contribute to our growing ecosystem
```

## �🌟 **Enterprise Impact**

Azora OS represents the next evolution of economic intelligence:

- **Planetary Scale**: Sovereign economic instantiation across 195 nations
- **Education Economics**: Transform education from cost to paid value creation
- **Constitutional AI**: Ethical AI governance for economic decision-making
- **Cryptographic Sovereignty**: Secure, private economic coordination
- **Universal Prosperity**: Knowledge-driven economic abundance for all

**Azora OS — Constitutional AI for Planetary Economic Flourishing**

*Building the future of sovereign prosperity through education and innovation*

## 📞 **Contact & Support**

- **Enterprise**: enterprise@azora.world
- **Technical Support**: support@azora.world
- **API Documentation**: `/docs/API_DOCUMENTATION.md`
- **Architecture Docs**: 
  - `/docs/AZORA-COMPREHENSIVE-ARCHITECTURE.md` - Complete system architecture
  - `AZORA-SAPIENS-ARCHITECTURE.md` - Azora Sapiens education platform architecture

---

**Azora OS — Constitutional AI for Planetary Economic Flourishing**

*Building the future of sovereign prosperity through education and innovation*