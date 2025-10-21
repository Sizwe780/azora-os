# Azora World Portal - Deployment Guide

## Overview
This guide covers deploying the azora.world portal to production using Vercel (recommended) or alternative platforms.

## Prerequisites
- Node.js 18+
- Git repository access
- Vercel account (for Vercel deployment)
- Domain: azora.world configured

## Environment Variables
Create the following environment variables in your deployment platform:

```bash
# Azora Identity Integration
VITE_AZORA_IDENTITY_URL=https://identity.azora.world
VITE_CLIENT_ID=your_client_id
VITE_REDIRECT_URI=https://azora.world/auth/callback

# Analytics (Optional)
VITE_GA_TRACKING_ID=your_ga_id
VITE_PLAUSIBLE_DOMAIN=azora.world

# Pulse API (Future)
VITE_PULSE_API_URL=https://pulse.azora.world/api
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd synapse
vercel --prod
```

3. **Configure Domain:**
```bash
vercel domains add azora.world
vercel domains add www.azora.world
```

4. **Set Environment Variables:**
```bash
vercel env add VITE_AZORA_IDENTITY_URL
vercel env add VITE_CLIENT_ID
# ... add other variables
```

### Option 2: Netlify

1. **Build Configuration:**
```bash
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option 3: Railway

1. **Connect Repository:**
- Link GitHub repository to Railway
- Set build command: `npm run build`
- Set publish directory: `dist`

2. **Environment Variables:**
Configure in Railway dashboard

## Post-Deployment Checklist

- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] Authentication redirects working
- [ ] Contact form submissions working
- [ ] Newsletter signup working
- [ ] Ecosystem stats loading
- [ ] All pages accessible
- [ ] SEO meta tags correct
- [ ] Sitemap accessible
- [ ] Robots.txt accessible

## Monitoring Setup

### Uptime Monitoring
```bash
# Use services like:
# - UptimeRobot
# - Pingdom
# - New Relic
```

### Error Tracking
```bash
# Add to index.html:
<script src="https://cdn.sentry.io/7.0.0/bundle.min.js"></script>
```

### Analytics
- Google Analytics 4
- Plausible Analytics (privacy-focused)
- Custom event tracking for auth flows

## Performance Optimization

### Core Web Vitals
- Largest Contentful Paint (LCP): <2.5s
- First Input Delay (FID): <100ms
- Cumulative Layout Shift (CLS): <0.1

### CDN & Caching
- Static assets cached for 1 year
- HTML cached for 0 seconds (SPA)
- API responses cached appropriately

## Security Headers
✅ Configured in vercel.json:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## Backup & Rollback
- Vercel provides automatic deployments
- Keep last 100 deployments
- Instant rollback capability

## Support Contacts
- Technical Issues: dev@azora.world
- Domain/DNS: infra@azora.world
- Security: security@azora.world