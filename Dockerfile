# Multi-stage production Dockerfile
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Install runtime dependencies
RUN apk add --no-cache \
    sqlite \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy application files
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs src/ ./src/
COPY --chown=nodeuser:nodejs package.json ./
COPY --chown=nodeuser:nodejs .env.example ./.env

# Create data directory
RUN mkdir -p data && chown nodeuser:nodejs data

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "src/server.js"]
