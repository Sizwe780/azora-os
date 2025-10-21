# Vigil Service Dockerfile
FROM node:18-alpine

# Install system dependencies for video processing
RUN apk add --no-cache \
    ffmpeg \
    gstreamer \
    gst-plugins-base \
    gst-plugins-good \
    gst-plugins-bad \
    gst-plugins-ugly \
    gst-libav

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S vigil -u 1001

# Change ownership
RUN chown -R vigil:nodejs /app
USER vigil

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3005/health || exit 1

# Start service
CMD ["npm", "start"]