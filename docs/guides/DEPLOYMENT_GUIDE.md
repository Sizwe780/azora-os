# 🚀 AZORA.WORLD DEPLOYMENT GUIDE

Complete guide to deploy Azora OS to production at **azora.world**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Infrastructure Setup
- [ ] Domain purchased: azora.world
- [ ] DNS configured (Cloudflare/Route53 recommended)
- [ ] SSL certificates ready (Let's Encrypt via Certbot)
- [ ] Server provisioned (VPS/Cloud)
- [ ] Docker installed on server
- [ ] Git repository access configured

### ✅ Environment Configuration
- [ ] Production `.env` file created
- [ ] All API keys configured for production
- [ ] Database connection strings updated
- [ ] JWT secrets rotated for production
- [ ] CORS origins set to azora.world
- [ ] Node environment set to `production`

### ✅ Database Setup
- [ ] MongoDB Atlas production cluster created
- [ ] Database indexes created
- [ ] Backup strategy configured
- [ ] Connection pooling optimized

### ✅ Security
- [ ] HTTPS/SSL enabled
- [ ] Rate limiting configured
- [ ] API authentication enabled
- [ ] Environment variables secured
- [ ] Firewall rules configured
- [ ] DDoS protection enabled (Cloudflare)

---

## 🏗️ DEPLOYMENT ARCHITECTURE

```
azora.world
    ├── Frontend (React + Vite) → Static files via CDN
    ├── API Gateway (Nginx) → Load balancer
    ├── Microservices (Docker)
    │   ├── AI Orchestrator (4001)
    │   ├── Klipp Service (4002)
    │   ├── Neural Context (4005)
    │   ├── Retail Partner Integration (4006)
    │   ├── Cold Chain Quantum (4007)
    │   ├── Universal Safety (4008)
    │   ├── Autonomous Operations (4009)
    │   ├── Quantum Tracking (4040)
    │   └── Quantum Deep Mind (4050) ⭐ Local AI
    ├── Database (MongoDB Atlas)
    └── Storage (S3/R2)
```

---

## 🔧 SERVER REQUIREMENTS

### Minimum Specs
- **CPU**: 4 cores (8 recommended for AI workloads)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 50GB SSD (100GB recommended)
- **Bandwidth**: 1TB/month minimum
- **OS**: Ubuntu 22.04 LTS or newer

### Recommended Providers
1. **DigitalOcean** - $48/month droplet (4 CPU, 8GB RAM)
2. **Linode** - $36/month (4 CPU, 8GB RAM)
3. **AWS EC2** - t3.large instance (~$60/month)
4. **Hetzner** - €25/month (4 CPU, 16GB RAM, best value!)

---

## 📦 DEPLOYMENT STEPS

### 1. Server Preparation

```bash
# Connect to server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Install Node.js (for building)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs -y

# Install pnpm
npm install -g pnpm

# Install Nginx
apt install nginx -y

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y
```

### 2. Repository Setup

```bash
# Clone repository
cd /opt
git clone https://github.com/azoraworld/azora-os.git
cd azora-os

# Install dependencies
pnpm install
```

### 3. Environment Configuration

```bash
# Create production .env
nano .env
```

**Production .env Template:**
```bash
# Environment
NODE_ENV=production

# Domain
FRONTEND_ORIGIN=https://azora.world
CORS_ORIGIN=https://azora.world,https://www.azora.world

# Database (Production MongoDB)
MONGO_URI=mongodb+srv://production_user:STRONG_PASSWORD@cluster0.mongodb.net/azora?retryWrites=true&w=majority

# JWT Secrets (ROTATE THESE!)
JWT_SECRET=[NEW_SECRET_GENERATE_WITH: openssl rand -base64 32]
JWT_ACCESS_SECRET=[NEW_SECRET_GENERATE_WITH: openssl rand -base64 32]
JWT_REFRESH_SECRET=[NEW_SECRET_GENERATE_WITH: openssl rand -base64 32]

# API Keys (Production)
GOOGLE_AI_API_KEY=your_production_key
MAPBOX_ACCESS_TOKEN=your_production_key
VITE_FIREBASE_API_KEY=your_production_key
# ... (add all production keys)

# Ports (internal - proxied by Nginx)
QUANTUM_TRACKING_PORT=4040
QUANTUM_DEEP_MIND_PORT=4050
# ... (all other service ports)

# Security
COOKIE_SECURE=true
COOKIE_DOMAIN=azora.world
```

### 4. Build Frontend

```bash
# Build optimized production bundle
pnpm run build

# Output will be in dist/ directory
ls -lh dist/
```

### 5. Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/azora.world
```

**Nginx Configuration:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name azora.world www.azora.world;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name azora.world www.azora.world;

    # SSL Configuration (Certbot will add these)
    ssl_certificate /etc/letsencrypt/live/azora.world/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/azora.world/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Root directory
    root /opt/azora-os/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    # Frontend (React SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy (Microservices)
    location /api/ai-orchestrator/ {
        proxy_pass http://localhost:4001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/tracking/ {
        proxy_pass http://localhost:4040/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ai/ {
        proxy_pass http://localhost:4050/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket for Quantum Tracking
    location /ws/tracking {
        proxy_pass http://localhost:4040;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/azora.world /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### 6. SSL Certificate Setup

```bash
# Get SSL certificate (interactive)
certbot --nginx -d azora.world -d www.azora.world

# Auto-renewal (test)
certbot renew --dry-run
```

### 7. Start Services with Docker Compose

**Create docker-compose.prod.yml:**
```bash
nano docker-compose.prod.yml
```

```yaml
version: '3.8'

services:
  # AI Orchestrator
  ai-orchestrator:
    build: ./services/ai-orchestrator
    restart: always
    ports:
      - "4001:4001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env

  # Klipp Service
  klipp:
    build: ./services/klipp-service
    restart: always
    ports:
      - "4002:4002"
    env_file:
      - .env

  # Neural Context Engine
  neural-context:
    build: ./services/neural-context-engine
    restart: always
    ports:
      - "4005:4005"
    env_file:
      - .env

  # Retail Partner Integration
  retail-partner:
    build: ./services/retail-partner-integration
    restart: always
    ports:
      - "4006:4006"
    env_file:
      - .env

  # Cold Chain Quantum
  cold-chain:
    build: ./services/cold-chain-quantum
    restart: always
    ports:
      - "4007:4007"
    env_file:
      - .env

  # Universal Safety
  safety:
    build: ./services/universal-safety
    restart: always
    ports:
      - "4008:4008"
    env_file:
      - .env

  # Autonomous Operations
  autonomous:
    build: ./services/autonomous-operations
    restart: always
    ports:
      - "4009:4009"
    env_file:
      - .env

  # Quantum Tracking (EV Leader × 100)
  quantum-tracking:
    build: ./services/quantum-tracking
    restart: always
    ports:
      - "4040:4040"
    env_file:
      - .env

  # Quantum Deep Mind (Local AI) 🧠
  quantum-ai:
    build: ./services/quantum-deep-mind
    restart: always
    ports:
      - "4050:4050"
    env_file:
      - .env
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

**Start all services:**
```bash
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 8. Create Dockerfiles for Each Service

**Example: services/quantum-deep-mind/Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 4050

CMD ["node", "index.js"]
```

### 9. Configure DNS

**At your domain registrar or Cloudflare:**
```
A Record:     azora.world → YOUR_SERVER_IP
A Record:     www.azora.world → YOUR_SERVER_IP
CNAME:        *.azora.world → azora.world (for subdomains)
```

### 10. Setup Monitoring & Auto-Restart

```bash
# Install PM2 for process management
npm install -g pm2

# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'quantum-ai',
      script: './services/quantum-deep-mind/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PORT: 4050
      }
    },
    // Add all other services...
  ]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup auto-start on reboot
pm2 startup
```

### 11. Setup Backups

```bash
# Create backup script
nano /opt/backup-azora.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/mongo_$DATE"

# Backup code
tar -czf "$BACKUP_DIR/code_$DATE.tar.gz" /opt/azora-os

# Keep only last 7 days
find $BACKUP_DIR -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /opt/backup-azora.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/backup-azora.sh
```

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### Health Checks
```bash
# Frontend
curl https://azora.world

# API Services
curl https://azora.world/api/ai/health
curl https://azora.world/api/tracking/health

# WebSocket
wscat -c wss://azora.world/ws/tracking
```

### Performance Testing
```bash
# Install Apache Bench
apt install apache2-utils -y

# Test frontend
ab -n 1000 -c 10 https://azora.world/

# Test API
ab -n 100 -c 5 https://azora.world/api/ai/stats
```

### Monitoring Setup
```bash
# Install monitoring tools
docker run -d -p 9090:9090 prom/prometheus
docker run -d -p 3001:3000 grafana/grafana
```

---

## 📊 PRODUCTION OPTIMIZATION

### 1. Enable Cloudflare CDN
- Add azora.world to Cloudflare
- Enable caching for static assets
- Enable Brotli compression
- Configure WAF rules

### 2. Database Indexing
```javascript
// In MongoDB Atlas
db.vehicles.createIndex({ location: "2dsphere" });
db.vehicles.createIndex({ status: 1, timestamp: -1 });
db.users.createIndex({ email: 1 }, { unique: true });
```

### 3. Rate Limiting
```javascript
// Add to services
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 🚨 TROUBLESHOOTING

### Service won't start
```bash
# Check logs
docker-compose logs quantum-ai
journalctl -u nginx -f

# Check ports
netstat -tlnp | grep 4050

# Restart service
docker-compose restart quantum-ai
```

### SSL issues
```bash
# Renew certificate manually
certbot renew --force-renewal

# Check certificate
openssl s_client -connect azora.world:443 -servername azora.world
```

### High memory usage
```bash
# Check memory
free -h
docker stats

# Restart services
docker-compose restart
```

---

## 🎯 FINAL CHECKLIST

- [ ] All services running: `docker-compose ps`
- [ ] SSL certificate valid: `https://azora.world`
- [ ] API responding: `curl https://azora.world/api/ai/health`
- [ ] WebSocket working: Test in browser at /tracking
- [ ] DNS resolving: `nslookup azora.world`
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Firewall rules set
- [ ] Auto-restart enabled
- [ ] Error logging configured

---

## 🎉 YOU'RE LIVE!

**Azora OS is now running at:**
- **Frontend**: https://azora.world
- **Quantum AI**: https://azora.world/ai
- **Quantum Tracking**: https://azora.world/tracking
- **API**: https://azora.world/api/*

**Share with the world! 🌍**

---

## 📞 SUPPORT

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Review Nginx logs: `/var/log/nginx/error.log`
3. Monitor system: `htop` or `docker stats`
4. Check firewall: `ufw status`

**Built with ❤️ by the Azora team**
