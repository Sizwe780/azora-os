# Dockerfile for Vigil API Service
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 vigil

# Copy dependencies
COPY --from=deps --chown=vigil:nodejs /app/node_modules ./node_modules

# Copy source code
COPY --chown=vigil:nodejs . .

# Switch to non-root user
USER vigil

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3005/health || exit 1

# Start the application
CMD ["node", "src/index.js"]