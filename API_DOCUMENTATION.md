# Azora OS API Documentation

**Planetary Economic Intelligence Platform - Sovereign API Reference**

This document provides comprehensive API documentation for the Azora OS planetary economic intelligence platform, featuring sovereign economic services, education systems, and constitutional AI governance.

## 🌍 **System Overview**

Azora OS operates as a distributed Node.js microservices platform with sovereign economic intelligence. All services implement RESTful APIs with WebSocket support for real-time coordination.

### **Service Endpoints**
- **Aegis Citadel** (`:4099`) - Global Genesis Command Center
- **Azora Sapiens** (`:4200`) - Universal Education Platform
- **Azora Mint** (`:4300`) - Economic Sovereignty Engine
- **Azora Oracle** (`:4030`) - Planetary Intelligence Oracle
- **Azora Nexus** (`:4000`) - Neural Coordination Hub
- **Azora Covenant** (`:4400`) - Blockchain Sovereignty
- **Azora Aegis** (`:4098`) - Security & Compliance
- **Azora Forge** (`:4500`) - Merchant & Marketplace

### **Common Headers**
```http
Content-Type: application/json
Authorization: Bearer <jwt-token>          # For authenticated endpoints
X-API-Key: <sovereign-api-key>             # For cross-service calls
X-Sovereign-Context: <nation-identifier>   # For economic operations
```

## 🔐 **Authentication & Sovereignty**

### **JWT Token Flow**
1. Authenticate via Aegis Citadel or Azora Sapiens
2. Receive JWT token with sovereign context
3. Include token in `Authorization: Bearer <token>` header
4. Tokens include nation sovereignty claims and expire after 24 hours

### **Sovereign Context**
All economic operations require sovereign context validation:
```json
{
  "nation": "ZA",           // ISO country code
  "sovereignty": "active",  // active, pending, instantiated
  "permissions": ["economic", "educational", "governance"]
}
```

---

## 🏰 **Aegis Citadel API** (`:4099`)

**Global Genesis Command Center - Planetary Economic Instantiation**

### **Genesis Fund Management**

#### **Get Global Fund Status**
```http
GET /api/citadel/genesis/status
Authorization: Bearer <token>
```

**Response**:
```json
{
  "fund": {
    "totalAllocation": 195000000,
    "allocated": 2000000,
    "remaining": 193000000,
    "currency": "AZR"
  },
  "nations": {
    "total": 193,
    "instantiated": 2,
    "pending": 15,
    "available": 176
  },
  "lastUpdated": "2025-10-23T10:30:00Z"
}
```

#### **Get Nation Seed Grant Details**
```http
GET /api/citadel/grants/:country
Authorization: Bearer <token>
```

**Parameters**:
- `country`: ISO country code (e.g., "BR", "KE", "ZA")

**Response**:
```json
{
  "country": "BR",
  "countryName": "Brazil",
  "grantAmount": 1000000,
  "currency": "AZR",
  "status": "instantiated",
  "instantiatedAt": "2025-10-15T14:20:00Z",
  "sovereignToken": "aBRL",
  "userCount": 15000,
  "activationTrigger": "university_treaty"
}
```

#### **Check Activation Triggers**
```http
POST /api/citadel/triggers/check
Authorization: Bearer <token>
Content-Type: application/json

{
  "country": "ZA",
  "triggerType": "user_threshold",
  "triggerData": {
    "userCount": 15000,
    "appUsers": 12000,
    "treatySigned": false
  }
}
```

**Response**:
```json
{
  "country": "ZA",
  "eligible": true,
  "triggers": {
    "userThreshold": true,
    "universityTreaty": false,
    "foundingTeam": false
  },
  "nextSteps": [
    "Sign Protocol-University Treaty",
    "Reach 10,000 Global Transfer users"
  ]
}
```

#### **Execute Instantiation Protocol**
```http
POST /api/citadel/instantiate/:country
Authorization: Bearer <sovereign-token>
Content-Type: application/json

{
  "confirmation": true,
  "sovereignAuthority": "council_approved",
  "economicParameters": {
    "baseCurrency": "ZAR",
    "initialPeg": 1.0,
    "sovereignToken": "aZAR"
  }
}
```

**Response**:
```json
{
  "country": "ZA",
  "status": "instantiation_started",
  "transactionId": "tx_1234567890",
  "estimatedCompletion": "2025-10-23T12:00:00Z",
  "sovereignToken": "aZAR",
  "initialSupply": 1000000
}
```

#### **Get Instantiated Economies**
```http
GET /api/citadel/economies
Authorization: Bearer <token>
```

**Response**:
```json
{
  "economies": [
    {
      "country": "BR",
      "countryName": "Brazil",
      "sovereignToken": "aBRL",
      "instantiatedAt": "2025-10-15T14:20:00Z",
      "userCount": 15000,
      "economicVelocity": 0.85,
      "status": "active"
    },
    {
      "country": "KE",
      "countryName": "Kenya",
      "sovereignToken": "aUSD",
      "instantiatedAt": "2025-10-18T09:15:00Z",
      "userCount": 8500,
      "economicVelocity": 0.72,
      "status": "active"
    }
  ],
  "total": 2,
  "globalVelocity": 0.78
}
```

### **Health & Monitoring**
```http
GET /health
```

**Response**:
```json
{
  "service": "aegis-citadel",
  "status": "healthy",
  "version": "1.0.0",
  "uptime": "15d 4h 23m",
  "sovereignFunds": "escrowed",
  "lastGenesisEvent": "2025-10-18T09:15:00Z"
}
```

---

## 🎓 **Azora Sapiens API** (`:4200`)

**Universal Education Platform - Knowledge Qualification & Aegis Assessment**

### **Program Management**

#### **Get Available Programs**
```http
GET /api/programs
Authorization: Bearer <token>
```

**Response**:
```json
{
  "programs": [
    {
      "id": "solar-tech-001",
      "title": "Solar Grid Technician",
      "description": "Complete photovoltaic systems training",
      "category": "Energy",
      "difficulty": "intermediate",
      "duration": 480, // minutes
      "modules": 12,
      "rewardRange": {
        "min": 100,
        "max": 200,
        "currency": "aZAR"
      },
      "aegisRequired": true
    },
    {
      "id": "hydro-farm-002",
      "title": "Hydroponic Farm Operator",
      "description": "Advanced hydroponic systems management",
      "category": "Agriculture",
      "difficulty": "advanced",
      "duration": 720,
      "modules": 18,
      "rewardRange": {
        "min": 150,
        "max": 300,
        "currency": "aZAR"
      },
      "aegisRequired": true
    }
  ]
}
```

#### **Enroll in Program**
```http
POST /api/enroll
Authorization: Bearer <token>
Content-Type: application/json

{
  "programId": "solar-tech-001",
  "userId": "user_123",
  "consentToAegis": true
}
```

**Response**:
```json
{
  "enrollmentId": "enroll_456",
  "programId": "solar-tech-001",
  "status": "active",
  "enrolledAt": "2025-10-23T10:30:00Z",
  "aegisSessionId": "aegis_sess_789",
  "nextModule": {
    "id": "module_001",
    "title": "Introduction to Photovoltaics",
    "estimatedTime": 45
  }
}
```

#### **Get User Enrollments**
```http
GET /api/enrollments/:userId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "enrollments": [
    {
      "id": "enroll_456",
      "programId": "solar-tech-001",
      "programTitle": "Solar Grid Technician",
      "status": "in_progress",
      "progress": 25,
      "enrolledAt": "2025-10-23T10:30:00Z",
      "lastAccessedAt": "2025-10-23T11:00:00Z",
      "completedModules": 3,
      "totalModules": 12,
      "earnedRewards": 450,
      "currency": "aZAR"
    }
  ]
}
```

### **Module & Assessment**

#### **Complete Module**
```http
POST /api/module/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "enrollmentId": "enroll_456",
  "moduleId": "module_001",
  "completionData": {
    "timeSpent": 42,
    "score": 95,
    "attempts": 1
  }
}
```

**Response**:
```json
{
  "moduleId": "module_001",
  "status": "completed",
  "reward": {
    "amount": 120,
    "currency": "aZAR",
    "transactionId": "reward_tx_123",
    "processedAt": "2025-10-23T11:05:00Z"
  },
  "nextModule": {
    "id": "module_002",
    "title": "Electrical Safety Standards",
    "unlocksAt": "2025-10-23T11:05:00Z"
  },
  "progress": {
    "overall": 8.33,
    "completedModules": 1,
    "totalModules": 12
  }
}
```

#### **Start Aegis Assessment**
```http
POST /api/exam/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "enrollmentId": "enroll_456",
  "assessmentType": "module_quiz",
  "moduleId": "module_001"
}
```

**Response**:
```json
{
  "assessmentId": "assess_789",
  "sessionId": "aegis_sess_789",
  "status": "active",
  "questions": 15,
  "timeLimit": 1800, // 30 minutes
  "aegisIntegrity": {
    "deviceLocked": true,
    "cameraActive": true,
    "microphoneActive": true,
    "sessionValid": true
  },
  "startedAt": "2025-10-23T11:10:00Z"
}
```

#### **Submit Assessment**
```http
POST /api/exam/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "assessmentId": "assess_789",
  "answers": {
    "q1": "c",
    "q2": "a",
    "q3": "b"
  },
  "timeSpent": 1650,
  "aegisData": {
    "integrityScore": 98,
    "anomalies": [],
    "sessionValid": true
  }
}
```

**Response**:
```json
{
  "assessmentId": "assess_789",
  "status": "graded",
  "score": 93,
  "passed": true,
  "reward": {
    "amount": 280,
    "currency": "aZAR",
    "category": "assessment_pass",
    "transactionId": "reward_tx_456"
  },
  "feedback": {
    "strengths": ["Excellent understanding of core concepts"],
    "improvements": ["Review advanced circuit theory"],
    "nextSteps": ["Proceed to practical lab module"]
  },
  "completedAt": "2025-10-23T11:37:00Z"
}
```

### **Knowledge Graph & Ascension**

#### **Get Ascension Protocol Status**
```http
GET /api/knowledge-graph/status
Authorization: Bearer <token>
```

**Response**:
```json
{
  "ascensionProtocol": {
    "status": "active",
    "progress": 23.4,
    "documentsProcessed": 15420,
    "knowledgeNodes": 89250,
    "processingRate": {
      "documentsPerHour": 45,
      "nodesPerHour": 280
    },
    "targetUniversities": [
      "MIT", "Stanford", "Oxford", "Harvard", "Cambridge"
    ],
    "lastUpdate": "2025-10-23T10:00:00Z"
  },
  "curriculumSynthesis": {
    "programsOptimized": 15,
    "firstPrinciplesApplied": true,
    "effectivenessImprovement": 34.7
  }
}
```

### **Health Check**
```http
GET /health
```

**Response**:
```json
{
  "service": "azora-sapiens",
  "status": "healthy",
  "version": "1.0.0",
  "activeUsers": 1250,
  "activeAssessments": 89,
  "aegisSessions": 67,
  "rewardTransactions": 2340
}
```

---

## 💰 **Azora Mint API** (`:4300`)

**Economic Sovereignty Engine - Proof-of-Knowledge Payments**

### **Health & Metrics**
```http
GET /api/health
```

**Response**:
```json
{
  "service": "azora-mint",
  "status": "healthy",
  "version": "1.0.0",
  "uptime": "12d 8h 15m",
  "activeEconomies": 2,
  "totalTransactions": 45670,
  "uboFundStatus": "active"
}
```

#### **Get Economic Metrics**
```http
GET /api/metrics
Authorization: Bearer <token>
```

**Response**:
```json
{
  "global": {
    "totalSupply": 1000000000,
    "circulatingSupply": 25000000,
    "marketCap": 500000000,
    "economicVelocity": 0.78
  },
  "sovereignTokens": [
    {
      "token": "aBRL",
      "supply": 1000000,
      "velocity": 0.85,
      "peggedTo": "BRL",
      "exchangeRate": 1.02
    },
    {
      "token": "aUSD",
      "supply": 850000,
      "velocity": 0.72,
      "peggedTo": "USD",
      "exchangeRate": 1.00
    }
  ],
  "uboFund": {
    "allocation": 10000000,
    "distributed": 2340000,
    "remaining": 7660000,
    "utilizationRate": 23.4
  }
}
```

### **Proof-of-Knowledge Rewards**

#### **Process Knowledge Reward**
```http
POST /api/knowledge-reward
Authorization: Bearer <sovereign-token>
Content-Type: application/json

{
  "userId": "user_123",
  "rewardType": "module_completion",
  "rewardCategory": "intermediate",
  "achievement": "Completed Photovoltaic Systems Module",
  "metadata": {
    "programId": "solar-tech-001",
    "moduleId": "module_005",
    "assessmentScore": 94,
    "timeSpent": 45
  }
}
```

**Response**:
```json
{
  "transactionId": "reward_tx_789",
  "userId": "user_123",
  "amount": 150,
  "currency": "aZAR",
  "rewardType": "module_completion",
  "status": "processed",
  "walletAddress": "azora_wallet_123",
  "processedAt": "2025-10-23T11:15:00Z",
  "confirmation": {
    "blockHeight": 123456,
    "transactionHash": "0x1234567890abcdef",
    "confirmations": 12
  }
}
```

#### **Get User Reward History**
```http
GET /api/knowledge-rewards/:userId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "userId": "user_123",
  "totalEarned": 2340,
  "currency": "aZAR",
  "transactions": [
    {
      "id": "reward_tx_789",
      "amount": 150,
      "type": "module_completion",
      "achievement": "Completed Photovoltaic Systems",
      "timestamp": "2025-10-23T11:15:00Z",
      "status": "confirmed"
    },
    {
      "id": "reward_tx_790",
      "amount": 280,
      "type": "assessment_pass",
      "achievement": "Passed Electrical Safety Quiz",
      "timestamp": "2025-10-23T11:37:00Z",
      "status": "confirmed"
    }
  ],
  "statistics": {
    "modulesCompleted": 12,
    "assessmentsPassed": 8,
    "certificationsEarned": 2,
    "averageReward": 195
  }
}
```

#### **Get Reward Statistics**
```http
GET /api/knowledge-rewards/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "global": {
    "totalRewardsDistributed": 2340000,
    "totalTransactions": 15670,
    "averageRewardAmount": 149,
    "totalBeneficiaries": 8450,
    "currency": "aZAR"
  },
  "byType": {
    "module_completion": {
      "count": 12450,
      "totalAmount": 1870000,
      "averageAmount": 150
    },
    "assessment_pass": {
      "count": 2890,
      "totalAmount": 420000,
      "averageAmount": 145
    },
    "certification": {
      "count": 330,
      "totalAmount": 50000,
      "averageAmount": 151
    }
  },
  "byProgram": {
    "solar-tech-001": {
      "rewards": 45000,
      "beneficiaries": 234,
      "completionRate": 89.2
    }
  },
  "trends": {
    "daily": [1200, 1450, 1320, 1680, 1520],
    "weekly": [8500, 9200, 10100, 8900],
    "monthly": [38000, 42000, 45600]
  }
}
```

#### **Get UBO Fund Status**
```http
GET /api/ubo/status
Authorization: Bearer <token>
```

**Response**:
```json
{
  "uboFund": {
    "totalAllocation": 10000000,
    "distributed": 2340000,
    "remaining": 7660000,
    "utilizationRate": 23.4,
    "currency": "aZAR"
  },
  "distribution": {
    "byCategory": {
      "module_completion": 79.5,
      "assessment_pass": 17.9,
      "certification": 2.6
    },
    "byProgram": {
      "solar_technician": 25.3,
      "hydroponic_farming": 18.7,
      "blockchain_basics": 15.2
    },
    "byRegion": {
      "africa": 45.2,
      "americas": 32.1,
      "asia": 22.7
    }
  },
  "economicImpact": {
    "knowledgeEconomyValue": 2340000,
    "estimatedRealWorldValue": 4680000,
    "beneficiaries": 8450,
    "averageMonthlyIncome": 277
  }
}
```

---

## 🔮 **Azora Oracle API** (`:4030`)

**Planetary Intelligence Oracle - Exchange Rates & Knowledge**

### **Exchange Rate Streaming**

#### **Get Current Rates**
```http
GET /api/rates
Authorization: Bearer <token>
```

**Response**:
```json
{
  "timestamp": "2025-10-23T12:00:00Z",
  "rates": {
    "AZR/USD": 2.45,
    "AZR/EUR": 2.12,
    "AZR/GBP": 1.89,
    "AZR/ZAR": 42.50,
    "aBRL/BRL": 1.02,
    "aUSD/USD": 1.00,
    "aZAR/ZAR": 1.00
  },
  "volatility": {
    "AZR": 0.023,
    "aBRL": 0.015,
    "aUSD": 0.008
  },
  "lastUpdate": "2025-10-23T11:59:45Z"
}
```

#### **Get Specific Rate Pair**
```http
GET /api/rates/:from/:to
Authorization: Bearer <token>
```

**Example**: `/api/rates/AZR/USD`

**Response**:
```json
{
  "pair": "AZR/USD",
  "rate": 2.45,
  "inverse": 0.4082,
  "change24h": 0.023,
  "changePercent24h": 0.95,
  "high24h": 2.48,
  "low24h": 2.42,
  "volume24h": 1250000,
  "lastUpdate": "2025-10-23T11:59:45Z"
}
```

### **Ascension Protocol**

#### **Get Ingestion Status**
```http
GET /api/ascension/ingestion/status
Authorization: Bearer <token>
```

**Response**:
```json
{
  "ingestion": {
    "status": "active",
    "progress": 23.4,
    "documentsProcessed": 15420,
    "totalDocuments": 65000,
    "processingRate": 45,
    "estimatedCompletion": "2026-03-15T00:00:00Z"
  },
  "sources": [
    {
      "university": "MIT",
      "documents": 3240,
      "processed": 3240,
      "status": "completed"
    },
    {
      "university": "Stanford",
      "documents": 2890,
      "processed": 2890,
      "status": "completed"
    },
    {
      "university": "Oxford",
      "documents": 4120,
      "processed": 3980,
      "status": "processing"
    }
  ],
  "knowledgeGraph": {
    "nodes": 89250,
    "relationships": 245600,
    "domains": ["physics", "mathematics", "computer_science", "biology"]
  }
}
```

#### **Start Knowledge Ingestion**
```http
POST /api/ascension/ingestion/start
Authorization: Bearer <sovereign-token>
Content-Type: application/json

{
  "source": "university",
  "university": "Cambridge",
  "documentTypes": ["research_papers", "textbooks", "lecture_notes"],
  "priority": "high"
}
```

**Response**:
```json
{
  "ingestionId": "ingest_123",
  "status": "started",
  "source": "Cambridge",
  "estimatedDocuments": 3800,
  "startedAt": "2025-10-23T12:00:00Z"
}
```

#### **Search Knowledge Graph**
```http
GET /api/ascension/knowledge/search?q=quantum+mechanics&domain=physics&limit=10
Authorization: Bearer <token>
```

**Response**:
```json
{
  "query": "quantum mechanics",
  "domain": "physics",
  "results": [
    {
      "id": "node_12345",
      "title": "Introduction to Quantum Mechanics",
      "source": "MIT Physics Department",
      "type": "lecture_notes",
      "relevance": 0.95,
      "firstPrinciples": true,
      "curriculumFit": ["advanced_physics", "quantum_computing"]
    },
    {
      "id": "node_12346",
      "title": "Quantum Entanglement Explained",
      "source": "Stanford Research Paper",
      "type": "research_paper",
      "relevance": 0.89,
      "firstPrinciples": true,
      "curriculumFit": ["quantum_physics", "information_theory"]
    }
  ],
  "totalResults": 127,
  "processingTime": 0.234
}
```

### **Health Check**
```http
GET /health
```

**Response**:
```json
{
  "service": "azora-oracle",
  "status": "healthy",
  "version": "1.0.0",
  "exchangeRates": "streaming",
  "ascensionProtocol": "active",
  "websocketConnections": 1250,
  "lastRateUpdate": "2025-10-23T11:59:45Z"
}
```

### **WebSocket Streaming**
```javascript
// Connect to real-time rate streaming
const ws = new WebSocket('ws://localhost:4030');

// Subscribe to rate updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['rates', 'volatility'],
  pairs: ['AZR/USD', 'aBRL/BRL']
}));

// Receive real-time updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Rate Update:', data);
  // {
  //   "type": "rate_update",
  //   "pair": "AZR/USD",
  //   "rate": 2.46,
  //   "timestamp": "2025-10-23T12:00:15Z"
  // }
};
```

---

## 🔗 **Cross-Service Integration**

### **WebSocket Coordination**
All services support WebSocket connections for real-time coordination:

```javascript
// Global event streaming
const ws = new WebSocket('ws://localhost:4000/events');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch(data.type) {
    case 'genesis_instantiation':
      // New economy created
      updateEconomicDashboard(data);
      break;

    case 'knowledge_reward':
      // Reward processed
      updateUserBalance(data);
      break;

    case 'aegis_alert':
      // Security event
      handleSecurityAlert(data);
      break;
  }
};
```

### **Service Mesh Communication**
Services communicate via internal APIs with automatic service discovery:

```http
# Service-to-service calls
POST /internal/citadel/triggers/check
X-Service-Auth: <internal-token>
Content-Type: application/json

{
  "country": "ZA",
  "internal": true
}
```

---

## ⚠️ **Error Handling**

### **Standard Error Response**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "country",
      "issue": "Invalid ISO country code"
    },
    "requestId": "req_123456",
    "timestamp": "2025-10-23T12:00:00Z"
  }
}
```

### **Common Error Codes**
- `AUTHENTICATION_ERROR`: Invalid or expired token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource doesn't exist
- `RATE_LIMITED`: Too many requests
- `SOVEREIGNTY_ERROR`: Invalid sovereign context
- `ECONOMIC_ERROR`: Economic operation failed
- `INTEGRITY_ERROR`: Aegis integrity violation

### **Sovereign-Specific Errors**
```json
{
  "error": {
    "code": "SOVEREIGNTY_NOT_INSTANTIATED",
    "message": "Economic sovereignty not yet instantiated for this nation",
    "resolution": "Complete activation triggers and petition The Council",
    "nation": "ZA",
    "availableTriggers": ["user_threshold", "university_treaty"]
  }
}
```

---

## 📊 **Rate Limiting & Scaling**

### **Rate Limits by Service**
- **Aegis Citadel**: 1000 req/min (sovereign operations)
- **Azora Sapiens**: 5000 req/min (educational operations)
- **Azora Mint**: 10000 req/min (economic transactions)
- **Azora Oracle**: 2000 req/min (intelligence queries)

### **Response Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1640995200
X-Sovereign-Context: ZA
X-API-Version: 1.0.0
```

---

## 🔧 **SDKs & Integration**

### **JavaScript/TypeScript SDK**
```javascript
import { AzoraOS } from '@azora/os-sdk';

const client = new AzoraOS({
  apiKey: 'your-sovereign-key',
  nation: 'ZA'
});

// Check genesis status
const status = await client.citadel.getGenesisStatus();

// Process knowledge reward
const reward = await client.mint.processKnowledgeReward({
  userId: 'user_123',
  rewardType: 'module_completion',
  amount: 150
});

// Get real-time rates
client.oracle.onRateUpdate((update) => {
  console.log(`${update.pair}: ${update.rate}`);
});
```

### **OpenAPI Specification**
Complete OpenAPI 3.0 specs available at:
- `/docs/citadel-api.yaml`
- `/docs/sapiens-api.yaml`
- `/docs/mint-api.yaml`
- `/docs/oracle-api.yaml`

---

**Azora OS API — Constitutional AI for Planetary Economic Flourishing**

*Building the future of sovereign prosperity through education and innovation*

For enterprise integrations or API support, contact: api@azora.world