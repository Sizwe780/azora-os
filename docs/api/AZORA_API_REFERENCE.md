# 🔌 AZORA OS - API REFERENCE

**Version:** 2.0.0  
**Base URL:** `https://api.azora.africa/v2`  
**Authentication:** Bearer token (JWT)

---

## TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [Azora Coin API](#azora-coin-api)
3. [Student API](#student-api)
4. [Founder API](#founder-api)
5. [Governance API](#governance-api)
6. [Analytics API](#analytics-api)
7. [Infrastructure API](#infrastructure-api)
8. [Webhooks](#webhooks)
9. [Rate Limits](#rate-limits)
10. [Error Codes](#error-codes)

---

## AUTHENTICATION

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "founder@azora.africa",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_123",
    "role": "FOUNDER",
    "ethAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5"
  },
  "expiresIn": 86400
}
```

### All requests require:
```http
Authorization: Bearer {token}
```

---

## AZORA COIN API

### Get Token Info

```http
GET /coin/info
```

**Response:**
```json
{
  "name": "Azora Coin",
  "symbol": "AZR",
  "decimals": 18,
  "maxSupply": "1000000.0",
  "totalSupply": "250000.0",
  "circulatingSupply": "100000.0",
  "usdValue": "1.00",
  "marketCap": "250000.00",
  "contractAddress": "0x...",
  "network": "Azora Mainnet",
  "chainId": 1337
}
```

### Get Balance

```http
GET /coin/balance/:address
```

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
  "balance": "1000.0",
  "balanceUSD": "1000.00",
  "vested": "333.33",
  "unvested": "666.67",
  "withdrawable": "100.0"
}
```

### Transfer Tokens

```http
POST /coin/transfer
Content-Type: application/json

{
  "to": "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  "amount": "10.0",
  "memo": "Payment for services"
}
```

---

## STUDENT API

### Register Student

```http
POST /students/register
Content-Type: application/json

{
  "firstName": "Thabo",
  "lastName": "Mbeki",
  "email": "thabo@university.ac.za",
  "ethAddress": "0x...",
  "institution": "University of Johannesburg",
  "country": "ZA"
}
```

**Response:**
```json
{
  "success": true,
  "student": {
    "id": "stu_456",
    "name": "Thabo Mbeki",
    "signupBonus": "10.0",
    "txHash": "0x..."
  }
}
```

### Get Student Earnings

```http
GET /students/:id/earnings
```

**Response:**
```json
{
  "studentId": "stu_456",
  "totalEarned": "145.50",
  "totalEarnedUSD": "145.50",
  "breakdown": {
    "signupBonus": "10.0",
    "dailyActivity": "45.0",
    "achievements": "50.0",
    "referrals": "30.0",
    "bugBounties": "10.5"
  },
  "pending": "5.0",
  "lifetime": "145.50"
}
```

---

## FOUNDER API

### Get Founder Info

```http
GET /founders/:address
```

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
  "name": "Jane Founder",
  "role": "FOUNDER",
  "joinDate": "2024-12-01",
  "allocation": "1000.0",
  "vested": "166.67",
  "unvested": "833.33",
  "withdrawn": "50.0",
  "available": "116.67",
  "contributions": {
    "commits": 245,
    "pullRequests": 67,
    "reviews": 123,
    "hoursLogged": 480
  },
  "monthlyWithdrawalUsed": "50.0",
  "monthlyWithdrawalLimit": "100.0"
}
```

### Request Withdrawal

```http
POST /founders/withdraw
Content-Type: application/json

{
  "amount": "100.0",
  "reason": "Living expenses",
  "urgency": "normal"
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "wdr_789",
  "amount": "100.0",
  "amountUSD": "100.00",
  "status": "pending_approval",
  "requiredApprovals": 2,
  "currentApprovals": 0,
  "estimatedApprovalTime": "24 hours",
  "message": "Your withdrawal request has been submitted to the board"
}
```

### Get Withdrawal Status

```http
GET /founders/withdraw/:requestId
```

---

## GOVERNANCE API

### Get Active Proposals

```http
GET /governance/proposals?status=active
```

**Response:**
```json
{
  "proposals": [
    {
      "id": "prop_123",
      "title": "Increase student signup bonus to 15 AZR",
      "description": "...",
      "proposer": "0x...",
      "status": "active",
      "votes": {
        "for": 3,
        "against": 1,
        "abstain": 0
      },
      "quorum": "3/5",
      "endsAt": "2024-12-15T00:00:00Z",
      "currentUserVote": null
    }
  ]
}
```

### Submit Proposal

```http
POST /governance/proposals
Content-Type: application/json

{
  "title": "Add new AI model to platform",
  "description": "Integrate Claude 3.5 Sonnet for better responses",
  "type": "FEATURE",
  "estimatedCost": "5000.0",
  "timeline": "2 weeks"
}
```

### Vote on Proposal

```http
POST /governance/proposals/:id/vote
Content-Type: application/json

{
  "vote": "for",
  "comment": "This will greatly improve user experience"
}
```

---

## ANALYTICS API

### Get Platform Stats

```http
GET /analytics/stats
```

**Response:**
```json
{
  "timestamp": "2024-12-10T12:00:00Z",
  "platform": {
    "totalUsers": 1245,
    "activeUsers24h": 456,
    "activeUsers7d": 890,
    "totalTransactions": 15678,
    "totalVolumeUSD": "45678.90"
  },
  "azoraCoin": {
    "price": "1.00",
    "marketCap": "250000.00",
    "holders": 1156,
    "transactions24h": 234
  },
  "students": {
    "total": 1000,
    "active": 789,
    "totalEarned": "12345.67"
  },
  "founders": {
    "total": 15,
    "active": 12,
    "totalVested": "2000.0"
  }
}
```

---

## INFRASTRUCTURE API

### Get Service Health

```http
GET /infra/health
```

**Response:**
```json
{
  "overall": "healthy",
  "services": {
    "postgres": {
      "status": "healthy",
      "uptime": "99.99%",
      "responseTime": "5ms"
    },
    "redis": {
      "status": "healthy",
      "uptime": "99.98%",
      "hitRate": "94%"
    },
    "blockchain": {
      "status": "healthy",
      "blockNumber": 123456,
      "gasPrice": "20 gwei"
    }
  },
  "infrastructure": {
    "cpuUsage": "45%",
    "memoryUsage": "62%",
    "diskUsage": "38%",
    "networkTraffic": "1.2 GB/s"
  }
}
```

---

## WEBHOOKS

### Register Webhook

```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/azora-webhook",
  "events": ["coin.transfer", "student.signup", "founder.withdrawal"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

**Event: coin.transfer**
```json
{
  "event": "coin.transfer",
  "timestamp": "2024-12-10T12:00:00Z",
  "data": {
    "from": "0x...",
    "to": "0x...",
    "amount": "10.0",
    "txHash": "0x..."
  }
}
```

---

## RATE LIMITS

- **Authenticated:** 1000 requests/hour
- **Public endpoints:** 100 requests/hour
- **Burst:** Up to 10 requests/second

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1702214400
```

---

## ERROR CODES

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Contact support |

**Error Response:**
```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Not enough AZR tokens for this transaction",
    "details": {
      "required": "100.0",
      "available": "50.0"
    }
  }
}
```

---

## SDK LIBRARIES

**JavaScript/TypeScript:**
```bash
npm install @azora/sdk
```

**Python:**
```bash
pip install azora-sdk
```

**Go:**
```bash
go get github.com/azora-os/go-sdk
```

**Ruby:**
```bash
gem install azora-sdk
```

---

*API Documentation - Version 2.0.0 - Updated December 2024*
