# 🔑 Azora OS API Keys & Environment Variables Reference

**Complete guide to all API keys, environment variables, and where they're used across the entire platform.**

---

## 📋 Quick Start Checklist

To get Azora OS fully operational, obtain API keys for:

- [ ] **OpenAI** - Core AI functionality
- [ ] **Stripe** - Payment processing
- [ ] **MongoDB** - Database storage
- [ ] **AWS S3** - File storage
- [ ] **Google Maps** - Location services
- [ ] **Firebase** - Push notifications
- [ ] **Twilio** - SMS/Voice (optional)
- [ ] **Slack** - Alert webhooks (optional)

---

## 🏗️ Service Architecture Map

### Core Services (Essential)

| Service | Port | File Path | API Keys Required |
|---------|------|-----------|-------------------|
| **Assistant** | 4000 | `services/assistant/index.js` | None (internal) |
| **AI Orchestrator** | 4001 | `services/ai-orchestrator/server.js` | `OPENAI_API_KEY`, `QUANTUM_SERVICE_URL` |
| **Klipp Marketplace** | 4002 | `services/klipp-service/index.js` | None (AI matching internal) |
| **Store Service** | 4002 | `services/store/index.js` | None |
| **Knowledge** | 4003 | `services/knowledge/index.js` | None |
| **Auth** | 4004 | `services/auth/index.js` | `JWT_SECRET` |
| **Neural Context Engine** | 4005 | `services/neural-context-engine/index.js` | `OPENAI_API_KEY` |
| **Retail Partner Integration** | 4006 | `services/retail-partner-integration/index.js` | `WOOLWORTHS_API_KEY`, `WOOLWORTHS_API_SECRET` |

### Revolutionary Services

| Service | Port | File Path | API Keys Required |
|---------|------|-----------|-------------------|
| **Cold Chain Quantum** | 4007 | `services/cold-chain-quantum/index.js` | None (AI prediction internal) |
| **Universal Safety** | 4008 | `services/universal-safety/index.js` | None (multi-modal detection internal) |
| **Autonomous Operations** | 4009 | `services/autonomous-operations/index.js` | `GOOGLE_MAPS_API_KEY` (optional) |

### Real-time Communication

| Service | Port | File Path | API Keys Required |
|---------|------|-----------|-------------------|
| **Voice** | 4010 | `services/voice/index.js` | `TWILIO_*` (optional) |
| **Conversation** | 4011 | `services/conversation/index.js` | None |
| **Speaker** | 4012 | `services/speaker/index.js` | None |

### Security Services

| Service | Port | File Path | API Keys Required |
|---------|------|-----------|-------------------|
| **Camera Monitor** | 4020 | `services/security-camera/index.js` | None |
| **POS Monitor** | 4021 | `services/security-pos/index.js` | None |
| **Security Core** | 4022 | `services/security-core/index.js` | `SLACK_WEBHOOK_URL` (optional) |
| **Security Dashboard** | 5176 | `apps/security-dashboard/` | None |

### Orchestration & Simulation

| Service | Port | File Path | API Keys Required |
|---------|------|-----------|-------------------|
| **Orchestrator** | 4030 | `services/ochestrator/index.ts` | None |
| **Simulator** | 4031 | `services/simulator/index.ts` | None |

---

## 🔐 API Keys by Category

### 1. Database & Storage

#### MongoDB
```bash
MONGO_URI=mongodb://localhost:27017/azora
```
- **Used in:** `backend/src/server.js`
- **Get from:** [MongoDB Atlas](https://cloud.mongodb.com)
- **Setup:**
  1. Create free cluster
  2. Add database user
  3. Whitelist IP (0.0.0.0/0 for development)
  4. Get connection string

#### AWS S3
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AZORA_EXPORT_BUCKET=azora-exports
```
- **Used in:** `apps/driver-pwa/src/server/storage.ts`
- **Get from:** [AWS IAM Console](https://console.aws.amazon.com/iam/)
- **Setup:**
  1. Create IAM user with S3 access
  2. Generate access keys
  3. Create S3 bucket
  4. Set bucket permissions

---

### 2. Payment Processing

#### Stripe
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```
- **Used in:** `services/payment/index.js`
- **Get from:** [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **Setup:**
  1. Create Stripe account
  2. Get test keys (start with `sk_test_` and `pk_test_`)
  3. For production, get live keys

#### Paystack (Alternative)
```bash
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```
- **Used in:** `apps/driver-pwa/src/server/payments/paystack.ts`, `webhook.ts`
- **Get from:** [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)
- **Setup:**
  1. Create Paystack account
  2. Get test API keys
  3. Configure webhooks

---

### 3. Authentication & Security

#### JWT Secrets
```bash
JWT_SECRET=your-super-secret-key-here
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
```
- **Used in:** 
  - `apps/driver-pwa/src/server/auth/routes.ts`
  - `apps/driver-pwa/src/server/utils/jwt.ts`
  - `apps/driver-pwa/src/middleware/auth.ts`
- **Generate with:**
  ```bash
  openssl rand -base64 32
  ```
- **Run this 3 times for each secret!**

#### Token Configuration
```bash
ACCESS_TOKEN_TTL=900          # 15 minutes
REFRESH_TOKEN_TTL=1209600     # 14 days
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false           # true in production
```
- **Used in:** `apps/driver-pwa/src/server/routes/auth.ts`

---

### 4. AI & Machine Learning

#### OpenAI
```bash
OPENAI_API_KEY=sk-...
```
- **Used in:**
  - AI Orchestrator
  - Neural Context Engine
  - Klipp Service AI matching
- **Get from:** [OpenAI Platform](https://platform.openai.com/api-keys)
- **Setup:**
  1. Create OpenAI account
  2. Add payment method
  3. Generate API key
- **Cost:** ~$0.002 per 1K tokens (GPT-4)

#### Google AI / Gemini
```bash
GOOGLE_AI_API_KEY=AIza...
```
- **Used in:** Various AI services (alternative to OpenAI)
- **Get from:** [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Setup:**
  1. Create Google Cloud project
  2. Enable Generative AI API
  3. Create credentials

#### Anthropic Claude
```bash
ANTHROPIC_API_KEY=sk-ant-...
```
- **Used in:** Advanced reasoning tasks
- **Get from:** [Anthropic Console](https://console.anthropic.com/)

#### Hugging Face
```bash
HUGGINGFACE_API_KEY=hf_...
```
- **Used in:** Custom AI models
- **Get from:** [Hugging Face](https://huggingface.co/settings/tokens)

---

### 5. Communication Services

#### Email / SMTP
```bash
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```
- **Used in:**
  - `apps/driver-pwa/src/server/jobs/scheduledExports.ts`
  - `apps/driver-pwa/src/server/utils/mailer.ts`
- **Gmail Setup:**
  1. Enable 2-factor authentication
  2. Generate App Password: [Google Account](https://myaccount.google.com/apppasswords)
  3. Use app password as `SMTP_PASS`

#### Twilio (SMS/Voice)
```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```
- **Used in:** `services/voice/index.js` (optional)
- **Get from:** [Twilio Console](https://console.twilio.com/)
- **Setup:**
  1. Create Twilio account ($15 free credit)
  2. Get Account SID and Auth Token
  3. Purchase phone number

#### Slack Webhooks
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```
- **Used in:** `services/security-core/index.js`
- **Get from:** [Slack API](https://api.slack.com/messaging/webhooks)
- **Setup:**
  1. Create Slack app
  2. Enable Incoming Webhooks
  3. Add webhook to workspace

---

### 6. Location & Mapping

#### Google Maps
```bash
GOOGLE_MAPS_API_KEY=AIza...
```
- **Used in:**
  - Route optimization
  - Autonomous operations
  - Tracking maps
- **Get from:** [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
- **Setup:**
  1. Create Google Cloud project
  2. Enable Maps JavaScript API, Directions API, Geocoding API
  3. Create credentials
  4. Set application restrictions
- **Cost:** $0.005 per map load, $0.005 per route

---

### 7. External Integrations

#### Retail Partner API
```bash
WOOLWORTHS_API_KEY=...
WOOLWORTHS_API_SECRET=...
```
- **Used in:** `services/retail-partner-integration/index.js`
- **Get from:** Retail Partner Developer Portal (contact Retail Partner)

#### Firebase (Push Notifications)
```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```
- **Used in:** PWA push notifications
- **Get from:** [Firebase Console](https://console.firebase.google.com/)
- **Setup:**
  1. Create Firebase project
  2. Add web app
  3. Enable Cloud Messaging
  4. Copy config values

---

### 8. Advanced Computing

#### Quantum Service
```bash
QUANTUM_SERVICE_URL=http://localhost:5000
```
- **Used in:**
  - `services/ai-orchestrator/quantumService.js`
  - `shield_service/src/config.js`
- **Note:** Internal service (no external API key needed)

---

## 🚀 Quick Setup Guide

### 1. Minimum Viable Configuration (Free Tier)

Start with these to get the system running:

```bash
# Authentication (Generate these)
JWT_SECRET=$(openssl rand -base64 32)
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Database (Free MongoDB Atlas)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/azora

# AI (OpenAI free trial or Google AI free tier)
OPENAI_API_KEY=sk-...
# OR
GOOGLE_AI_API_KEY=AIza...
```

### 2. Production-Ready Configuration

Add these for full functionality:

```bash
# Payments
STRIPE_SECRET_KEY=sk_live_...
PAYSTACK_SECRET_KEY=sk_live_...

# Storage
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...

# Maps
GOOGLE_MAPS_API_KEY=AIza...

# Notifications
VITE_FIREBASE_API_KEY=...
SLACK_WEBHOOK_URL=...
```

---

## 📊 Cost Estimation

### Free Tier Services
- MongoDB Atlas: 512MB free
- Google AI: 60 requests/min free
- Firebase: 10GB storage, 1GB transfer free
- Vercel: Unlimited hobby projects

### Paid Services (Monthly Estimates)
- OpenAI: ~$20-100 (depends on usage)
- Stripe: 2.9% + $0.30 per transaction
- AWS S3: ~$5-20
- Google Maps: ~$10-50
- Twilio: ~$10-30

**Total estimated monthly cost:** $45-200 for moderate usage

---

## 🔍 Verification Commands

Test each service is properly configured:

```bash
# Test MongoDB connection
node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('✅ MongoDB OK'))"

# Test OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Stripe API
curl https://api.stripe.com/v1/balance \
  -u $STRIPE_SECRET_KEY:

# Test AWS credentials
aws s3 ls --region $AWS_REGION

# Test Firebase (from browser console)
# firebase.initializeApp({apiKey: "..."})
```

---

## 🛠️ Troubleshooting

### Common Issues

**"Invalid API Key"**
- Check for extra spaces in `.env` file
- Ensure no quotes around values
- Verify key is activated on provider's dashboard

**"Connection Refused"**
- Check service is running on correct port
- Verify firewall/security group settings
- Confirm localhost vs 0.0.0.0 binding

**"CORS Error"**
- Update `CORS_ORIGIN` in `.env`
- Ensure frontend URL matches exactly

**"JWT Verification Failed"**
- Regenerate secrets with `openssl rand -base64 32`
- Clear browser cookies/localStorage
- Check token TTL values

---

## 📚 Related Documentation

- [Launch Kit](../launch-kit.md) - Full deployment guide
- [Upgrades Summary](./UPGRADES.md) - System architecture
- [Constitution](../overview/CONSTITUTION.md) - Core principles
- [Implementation Checklist](../operations/IMPLEMENTATION_CHECKLIST.md) - Operational rollout steps

---

## 🎯 Priority Order for API Key Setup

1. **JWT Secrets** (critical - generate immediately)
2. **MongoDB** (critical - data storage)
3. **OpenAI** (important - core AI features)
4. **Stripe** (important - payments)
5. **AWS S3** (optional - file storage)
6. **Google Maps** (optional - location features)
7. **Firebase** (optional - push notifications)
8. **Twilio** (optional - SMS/voice)
9. **Slack** (optional - alerts)

---

**Last Updated:** October 10, 2025  
**Azora OS Version:** Galactic Edition  
**Total Services:** 22+ microservices  
**Total API Keys Needed:** 11 categories
