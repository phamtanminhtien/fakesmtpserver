# Fake SMTP Server

A monorepo containing a fake SMTP server with a React frontend and NestJS backend.

## Docker Setup

This project includes Docker configurations for both development and production environments.

### Prerequisites

- Docker
- Docker Compose

### Production Build

To build and run the application in production mode:

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build
```

This will:

- Build the backend (NestJS) application and serve it on port 3000
- Build the frontend (React) application and serve it via nginx on port 80
- Set up networking between the services

### Development Build

For development with hot reloading:

```bash
# Build and start in development mode
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Or simply (docker-compose automatically uses override file)
docker-compose up --build
```

This will:

- Start the backend with hot reloading on port 3000
- Start the frontend with Vite dev server on port 5173
- Mount source code volumes for live editing

### Available Services

- **Frontend**: http://localhost (production) or http://localhost:5173 (development)
- **Backend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api (proxied through frontend in production)

### Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs

# Rebuild and start
docker-compose up --build

# Remove all containers and volumes
docker-compose down -v
```

### Architecture

- **Backend**: NestJS application running on Node.js 18 Alpine
- **Frontend**: React + Vite application served by nginx in production
- **Networking**: Services communicate via Docker network
- **Health Checks**: Both services include health check endpoints
- **Security**: Non-root users in production containers

### File Structure

```
├── packages/
│   ├── backend/
│   │   ├── Dockerfile
│   │   └── src/
│   └── frontend/
│       ├── Dockerfile
│       ├── nginx.conf
│       └── src/
├── docker-compose.yml          # Production configuration
├── docker-compose.override.yml # Development overrides
└── .dockerignore              # Docker ignore patterns
```
