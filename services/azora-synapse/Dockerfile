FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production || npm install --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 4086

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4086/health || exit 1

# Start the service
CMD ["node", "index.js"]