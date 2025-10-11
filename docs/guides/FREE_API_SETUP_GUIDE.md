# 🆓 Free API Setup Guide for Azora OS

**Complete setup guide using 100% FREE APIs - No credit card required!**

---

## ✅ Already Configured

### 1. JWT Secrets (Authentication) ✅
**Status:** Generated and configured in `.env`

```bash
JWT_SECRET=tTMYhmvoiLrVDxfQEkhUgUcDPIri9ptio4wDPwxZ8MM=
JWT_ACCESS_SECRET=3rkcdfZEZSvgDpdg6SdpWHxmDl2G4dZ5C/5TvLMZ1/s=
JWT_REFRESH_SECRET=ct+IThc5u6F1z/W7SGpHIZx1/0h3nirm/m4bNmdsb0g=
```

**Cost:** $0 (generated locally)

---

## 🎯 Priority APIs to Configure (100% Free, No Credit Card)

### 2. Google AI / Gemini (Recommended for AI) ⭐

**Why:** Best free AI option - 60 requests/minute forever, no credit card!

**Steps:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)
5. Add to `.env`:
   ```bash
   GOOGLE_AI_API_KEY=AIza...your-key-here
   ```

**Free Tier:** 60 requests/min permanently free  
**Cost:** $0/month  
**No Credit Card Required:** ✅

---

### 3. Mapbox (Maps & Geolocation) ⭐

**Why:** 100,000 free requests/month - better than Google Maps free tier!

**Steps:**
1. Go to https://account.mapbox.com/
2. Sign up (email only, no credit card)
3. Go to https://account.mapbox.com/access-tokens/
4. Copy your default public token (starts with `pk.`)
5. Add to `.env`:
   ```bash
   MAPBOX_ACCESS_TOKEN=pk.your-token-here
   ```

**Free Tier:** 100,000 map loads/month  
**Cost:** $0/month  
**No Credit Card Required:** ✅

---

### 4. MongoDB Atlas (Database) ⭐

**Why:** 512MB forever free, perfect for development

**Steps:**
1. Go to https://cloud.mongodb.com
2. Sign up (email only, no credit card for free tier)
3. Create a free cluster (M0 Sandbox - 512MB)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your database user password
7. Add to `.env`:
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/azora
   ```

**Free Tier:** 512MB storage permanently  
**Cost:** $0/month  
**No Credit Card Required:** ✅

---

### 5. Hugging Face (AI Models) ⭐

**Why:** Free access to thousands of AI models

**Steps:**
1. Go to https://huggingface.co/join
2. Sign up (email only)
3. Go to https://huggingface.co/settings/tokens
4. Click "New token" → "Read" access
5. Copy the token (starts with `hf_`)
6. Add to `.env`:
   ```bash
   HUGGINGFACE_API_KEY=hf_your-token-here
   ```

**Free Tier:** Unlimited inference API calls  
**Cost:** $0/month  
**No Credit Card Required:** ✅

---

### 6. Firebase (Push Notifications, Real-time)

**Why:** 10GB storage, 1GB transfer free forever

**Steps:**
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Add a web app (</> icon)
4. Copy the config values
5. Add to `.env`:
   ```bash
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

**Free Tier:** 10GB storage, 1GB transfer/day  
**Cost:** $0/month  
**No Credit Card Required:** ✅

---

### 7. Slack Webhooks (Alerts & Notifications)

**Why:** Free, instant alerts to your Slack workspace

**Steps:**
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Enable "Incoming Webhooks"
4. Click "Add New Webhook to Workspace"
5. Select a channel and authorize
6. Copy the webhook URL
7. Add to `.env`:
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
   ```

**Free Tier:** Unlimited webhooks  
**Cost:** $0/month  
**No Credit Card Required:** ✅

---

## 🔄 Optional Free Services

### 8. Supabase (Alternative Database & Storage)

**Why:** Free PostgreSQL database + 1GB storage

**Steps:**
1. Go to https://supabase.com
2. Sign up (GitHub/Google, no credit card)
3. Create a new project
4. Get your API keys from Project Settings

**Free Tier:** 500MB database, 1GB storage, 2GB transfer  
**Cost:** $0/month  
**No Credit Card Required:** ✅

---

### 9. Stripe (Payment Testing)

**Why:** Test mode doesn't require credit card

**Steps:**
1. Go to https://dashboard.stripe.com/register
2. Sign up (email + phone verification)
3. Stay in TEST MODE (toggle in top left)
4. Go to Developers → API Keys
5. Copy test keys (start with `sk_test_` and `pk_test_`)
6. Add to `.env`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your-key
   STRIPE_PUBLISHABLE_KEY=pk_test_your-key
   ```

**Free Tier:** Unlimited test transactions  
**Cost:** $0/month (test mode)  
**No Credit Card Required:** ✅ (for test mode)

---

## 📊 Your Free Tech Stack

| Service | Free Tier | Monthly Cost | Setup Time |
|---------|-----------|--------------|------------|
| JWT Auth | ✅ Unlimited | $0 | ✅ Done |
| Google AI | 60 req/min | $0 | 2 min |
| Mapbox | 100K requests | $0 | 2 min |
| MongoDB | 512MB | $0 | 5 min |
| Hugging Face | Unlimited | $0 | 2 min |
| Firebase | 10GB storage | $0 | 5 min |
| Slack | Unlimited | $0 | 3 min |
| **TOTAL** | **More than enough** | **$0/month** | **~20 min** |

---

## 🚀 Quick Setup Checklist

```bash
# 1. JWT Secrets ✅ (Already done!)

# 2. Google AI (2 minutes)
[ ] Sign up at https://makersuite.google.com/app/apikey
[ ] Create API key
[ ] Add to .env: GOOGLE_AI_API_KEY=

# 3. Mapbox (2 minutes)
[ ] Sign up at https://account.mapbox.com/
[ ] Copy access token
[ ] Add to .env: MAPBOX_ACCESS_TOKEN=

# 4. MongoDB (5 minutes)
[ ] Sign up at https://cloud.mongodb.com
[ ] Create free cluster
[ ] Get connection string
[ ] Add to .env: MONGO_URI=

# 5. Hugging Face (2 minutes)
[ ] Sign up at https://huggingface.co/join
[ ] Create token
[ ] Add to .env: HUGGINGFACE_API_KEY=

# 6. Firebase (5 minutes) - Optional
[ ] Create project at https://console.firebase.google.com/
[ ] Add web app
[ ] Copy config values
[ ] Add to .env: VITE_FIREBASE_*=

# 7. Slack (3 minutes) - Optional
[ ] Create webhook at https://api.slack.com/apps
[ ] Add to .env: SLACK_WEBHOOK_URL=
```

---

## 🛠️ After Configuration

### Test Your Setup

```bash
# Check which services are running
./check-services.sh

# Verify .env configuration
cat .env | grep -E "API_KEY=.+|TOKEN=.+|SECRET=.+"

# Test MongoDB connection
node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('✅ MongoDB OK')).catch(e => console.log('❌', e.message))"
```

### Start All Services

```bash
# Start Azora OS
pnpm run dev

# Or with logging
nohup pnpm run dev > azora-services.log 2>&1 &
```

### Access Your Platform

- 🌐 **Frontend:** http://localhost:5173
- 🧠 **AI Orchestrator:** http://localhost:4001
- 🛒 **Klippa Marketplace:** http://localhost:4002
- ❄️ **Cold Chain:** http://localhost:4007
- 🛡️ **Universal Safety:** http://localhost:4008
- 🚗 **Autonomous Ops:** http://localhost:4009

---

## 💡 Pro Tips

### Maximize Free Tiers

1. **Google AI**: Cache responses to reduce API calls
2. **Mapbox**: Use static maps instead of interactive when possible
3. **MongoDB**: Index your queries for better performance
4. **Firebase**: Use compression for storage

### Rate Limiting

Add rate limiting to your APIs to stay within free tiers:

```javascript
// Simple rate limiter
const rateLimiter = {
  calls: 0,
  resetTime: Date.now() + 60000, // 1 minute
  
  async check() {
    if (Date.now() > this.resetTime) {
      this.calls = 0;
      this.resetTime = Date.now() + 60000;
    }
    
    if (this.calls >= 60) { // Google AI limit
      throw new Error('Rate limit exceeded');
    }
    
    this.calls++;
  }
};
```

---

## 🔐 Security Best Practices

### Never Commit .env

```bash
# Already in .gitignore, but verify:
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Ensure .env is ignored"
```

### Use Environment-Specific Files

```bash
# Development
.env.development

# Production
.env.production

# Local (git ignored)
.env.local
```

---

## 📈 When to Upgrade

You'll need paid tiers when:

- **Google AI**: >60 requests/min consistently
- **Mapbox**: >100,000 map loads/month
- **MongoDB**: >512MB data
- **Firebase**: >10GB storage or >1GB transfer/day

**Estimated Cost at Scale:**
- Light usage: Still $0/month
- Medium usage (1000 users): ~$20-50/month
- Heavy usage (10,000 users): ~$200-500/month

---

## 🆘 Troubleshooting

### "Invalid API Key"

```bash
# Check for spaces/newlines
sed -i 's/[[:space:]]*$//' .env

# Verify key format
grep "API_KEY" .env
```

### "Rate Limit Exceeded"

```bash
# Check your usage
# For Google AI: https://makersuite.google.com/app/apikey
# For Mapbox: https://account.mapbox.com/
```

### "Connection Refused"

```bash
# Check services are running
./check-services.sh

# Restart if needed
kill $(cat azora.pid)
pnpm run dev
```

---

## 📚 Additional Resources

- [Google AI Documentation](https://ai.google.dev/docs)
- [Mapbox Documentation](https://docs.mapbox.com/)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)
- [Hugging Face API](https://huggingface.co/docs/api-inference)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Last Updated:** October 10, 2025  
**Total Setup Time:** ~20 minutes  
**Total Monthly Cost:** $0 for development  
**Credit Card Required:** No! 🎉

**Ready to build something amazing!** 🚀
