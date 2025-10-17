# Azora OS - AI/ML Engine Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for TensorFlow.js
RUN apk add --no-cache \
    python3 \
    py3-pip \
    build-base \
    && ln -sf python3 /usr/bin/python

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S azora -u 1001

# Change ownership of app directory
RUN chown -R azora:nodejs /app
USER azora

# Expose port
EXPOSE 4010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4010/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the service
CMD ["node", "index.js"]