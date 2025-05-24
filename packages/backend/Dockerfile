# Use Node.js 18 Alpine as base image for smaller size
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json from root and backend
COPY package*.json ./
COPY lerna.json ./
COPY packages/backend/package*.json ./packages/backend/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci
COPY packages/backend/ ./packages/backend/
WORKDIR /app/packages/backend
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build
RUN npm ci
COPY packages/backend/ ./packages/backend/
WORKDIR /app/packages/backend
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package.json and install only production dependencies
COPY packages/backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build /app/packages/backend/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# Expose port
EXPOSE 3000 2525

# Start the application
CMD ["node", "dist/main.js"] 