FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm ci --only=production || npm install --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S azora -u 1001

# Change ownership
RUN chown -R azora:nodejs /app
USER azora

# Expose port
EXPOSE 4090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4090/health || exit 1

# Start the service
CMD ["npm", "start"]