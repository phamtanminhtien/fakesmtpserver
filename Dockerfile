# Multi-stage build for both frontend and backend in one image
FROM node:18-alpine AS base

# Declare a build-time argument
ARG REFRESH_INTERVAL=3000

# Set an environment variable for Vite
ENV VITE_REFRESH_INTERVAL=$REFRESH_INTERVAL

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY lerna.json ./

# Copy both packages
COPY packages/ ./packages/

# Install all dependencies
RUN npm ci && npm cache clean --force

# Build backend
FROM base AS build-backend
WORKDIR /app/packages/backend
RUN npm run build

# Build frontend
FROM base AS build-frontend
WORKDIR /app/packages/frontend
RUN npm run build

# Production stage - combine everything
FROM node:18-alpine AS production

# Install nginx, curl, and supervisor
RUN apk add --no-cache nginx curl supervisor

# Create necessary directories
RUN mkdir -p /var/log/supervisor
RUN mkdir -p /run/nginx

# Set working directory
WORKDIR /app

# Copy backend dependencies and built files
COPY packages/backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --only=production && npm cache clean --force

# Copy built backend
COPY --from=build-backend /app/packages/backend/dist ./dist

# Copy built frontend to nginx directory
COPY --from=build-frontend /app/packages/frontend/dist /usr/share/nginx/html

# Copy configuration files
COPY nginx-single.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY start.sh /app/start.sh
COPY healthcheck.sh /app/healthcheck.sh

# Make scripts executable
RUN chmod +x /app/start.sh /app/healthcheck.sh

# Expose port 80 (nginx serves both frontend and proxies API)
EXPOSE 80 2525

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD /app/healthcheck.sh

# Start both services
CMD ["/app/start.sh"] 