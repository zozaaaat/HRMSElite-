# Multi-stage Dockerfile for HRMS Elite
# Stage 1: Build frontend
FROM node:20.19.4-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY electron/package*.json ./electron/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:20.19.4-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build backend
RUN npm run build

# Stage 3: Production runtime
FROM node:20.19.4-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/dist/public ./dist/public

# Copy built backend from backend-builder
COPY --from=backend-builder /app/dist ./dist

# Copy shared files
COPY --from=backend-builder /app/shared ./shared

# Copy database schema and migrations
COPY --from=backend-builder /app/drizzle.config.ts ./
COPY --from=backend-builder /app/dev.db ./dev.db

# Copy environment template
COPY --from=backend-builder /app/.env.example ./.env.example

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs /app/temp

# Set proper permissions
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"] 