# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY lerna.json ./
COPY packages/frontend/package*.json ./packages/frontend/

# Install dependencies
RUN npm ci && npm cache clean --force

# Development stage
FROM base AS development
COPY packages/frontend/ ./packages/frontend/
WORKDIR /app/packages/frontend
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM base AS build
COPY packages/frontend/ ./packages/frontend/
WORKDIR /app/packages/frontend
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 