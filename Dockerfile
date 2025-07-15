# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Minimal production stage using distroless
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app

# Copy minimal required files
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# Switch to non-root user (distroless already uses non-root)
USER 1001

EXPOSE 4000
CMD ["src/server.js"]
