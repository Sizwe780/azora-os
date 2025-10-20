# AI Website Builder Service Dockerfile

# Build stage
FROM node:18-alpine AS builder

# Install system dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to skip downloading Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init

# Set Puppeteer configuration
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy built dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads deployments/sites deployments/archives

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]