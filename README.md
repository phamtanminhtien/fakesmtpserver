# Fake SMTP Server

A monorepo containing a fake SMTP server with a React frontend and NestJS backend.

## Docker Setup

This project includes Docker configurations for both development and production environments with two deployment options:

1. **Multi-service setup** (frontend + backend in separate containers)
2. **Single image setup** (frontend + backend in one container)

### Prerequisites

- Docker
- Docker Compose

## Option 1: Multi-Service Setup

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

## Option 2: Single Image Setup

For simpler deployment with everything in one container:

```bash
# Build and start single unified image
docker-compose -f docker-compose.single.yml up --build

# Run in detached mode
docker-compose -f docker-compose.single.yml up -d --build

# Or use the helper script
./docker.sh single
```

This will:

- Build both frontend and backend in a single image
- Serve frontend via nginx on port 80
- Run backend on internal port 3000
- Proxy API calls from `/api/` to the backend
- Use supervisor to manage both processes

### Available Services

**Multi-service setup:**

- **Frontend**: http://localhost (production) or http://localhost:5173 (development)
- **Backend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api (proxied through frontend in production)

**Single image setup:**

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api

### Docker Commands

#### Multi-service commands:

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

#### Single image commands:

```bash
# Build and start unified image
docker-compose -f docker-compose.single.yml up --build

# Stop unified image
docker-compose -f docker-compose.single.yml down

# View logs
docker-compose -f docker-compose.single.yml logs
```

#### Helper script commands:

```bash
# Multi-service
./docker.sh build    # Build images
./docker.sh up       # Start production
./docker.sh dev      # Start development
./docker.sh down     # Stop services
./docker.sh logs     # View logs

# Single image
./docker.sh single     # Build and start unified image
./docker.sh single-dev # Build and start unified image (attached)
./docker.sh single-down # Stop unified image
./docker.sh single-logs # View unified image logs
```

### Architecture

**Multi-service setup:**

- **Backend**: NestJS application running on Node.js 18 Alpine
- **Frontend**: React + Vite application served by nginx in production
- **Networking**: Services communicate via Docker network
- **Health Checks**: Both services include health check endpoints
- **Security**: Non-root users in production containers

**Single image setup:**

- **Combined**: Both frontend and backend in one container
- **Frontend**: React app served by nginx on port 80
- **Backend**: NestJS app running on port 3000 (internal)
- **Process Management**: Supervisor manages both nginx and Node.js
- **Reverse Proxy**: Nginx proxies `/api/` requests to internal backend

### File Structure

```
├── packages/
│   ├── backend/
│   │   ├── Dockerfile              # Individual backend Dockerfile
│   │   └── src/
│   └── frontend/
│       ├── Dockerfile              # Individual frontend Dockerfile
│       ├── nginx.conf              # Frontend nginx config
│       └── src/
├── Dockerfile                      # Single unified image
├── docker-compose.yml              # Multi-service production
├── docker-compose.override.yml     # Multi-service development
├── docker-compose.single.yml       # Single image configuration
├── docker.sh                       # Helper script
└── .dockerignore                   # Docker ignore patterns
```

### When to Use Which Setup

**Use Multi-service setup when:**

- You need to scale frontend and backend independently
- You want to deploy services separately
- You need development hot reloading
- You prefer microservices architecture

**Use Single image setup when:**

- You want simpler deployment
- You have resource constraints
- You need everything in one container
- You're deploying to platforms that prefer single containers

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software without any restrictions.
