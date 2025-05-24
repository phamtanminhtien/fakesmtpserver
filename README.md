# Fake SMTP Server

A monorepo containing a fake SMTP server with a React frontend and NestJS backend.

## Docker Setup

This project includes Docker configurations for both development and production environments with three deployment options:

1. **Simple Docker Run** (single command deployment)
2. **Single image setup** (frontend + backend in one container)
3. **Multi-service setup** (frontend + backend in separate containers)

### Prerequisites

- Docker
- Docker Compose (for options 2-3)

## Option 1: Simple Docker Run

For quick testing and simple deployments using the pre-built image:

```bash
# Run directly with docker
docker run -d \
  --name fake-smtp-server \
  --restart unless-stopped \
  -p 80:80 \
  -p 2525:2525 \
  phamtanminhtien/fake-smtp-server:latest

# View logs
docker logs fake-smtp-server

# Stop container
docker stop fake-smtp-server

# Remove container
docker rm fake-smtp-server
```

This will:

- Use the pre-built image `phamtanminhtien/fake-smtp-server:latest` from Docker Hub
- Run the container in detached mode
- Map port 80 for the web interface
- Map port 2525 for SMTP server
- Auto-restart on failure
- Minimal setup required

## Option 2: Single Image Setup

For deployment with docker-compose using either pre-built or locally built image:

### Using Pre-built Image (Recommended)

```bash
# Pull and start the pre-built image
docker-compose -f docker-compose.single.yml up -d

# Or pull manually first
docker pull phamtanminhtien/fake-smtp-server:latest
docker-compose -f docker-compose.single.yml up -d
```

### Building Locally

```bash
# Build and start single unified image
docker-compose -f docker-compose.single.yml up --build

# Run in detached mode
docker-compose -f docker-compose.single.yml up -d --build

# Or use the helper script
./docker.sh single
```

This will:

- Serve frontend via nginx on port 80
- Run backend on internal port 3000
- SMTP server available on port 2525
- Proxy API calls from `/api/` to the backend
- Use supervisor to manage both processes
- Include health checks and auto-restart

## Option 3: Multi-Service Setup

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

**Simple Docker Run (Option 1):**

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **SMTP Server**: localhost:2525

**Single image setup (Option 2):**

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **SMTP Server**: localhost:2525

**Multi-service setup (Option 3):**

- **Frontend**: http://localhost (production) or http://localhost:5173 (development)
- **Backend API**: http://localhost:3000/api (proxied through frontend in production)
- **SMTP Server**: localhost:2525

### Docker Commands

#### Docker run commands (Option 1 - Simple):

```bash
# Start container
docker run -d --name fake-smtp-server --restart unless-stopped -p 80:80 -p 2525:2525 phamtanminhtien/fake-smtp-server:latest

# View logs
docker logs fake-smtp-server

# Follow logs
docker logs -f fake-smtp-server

# Stop and remove
docker stop fake-smtp-server && docker rm fake-smtp-server

# Restart container
docker restart fake-smtp-server
```

#### Single image commands (Option 2):

```bash
# Using pre-built image (recommended)
docker-compose -f docker-compose.single.yml up -d

# Pull latest image
docker pull phamtanminhtien/fake-smtp-server:latest

# Build locally
docker-compose -f docker-compose.single.yml up --build

# Stop service
docker-compose -f docker-compose.single.yml down

# View logs
docker-compose -f docker-compose.single.yml logs
```

#### Multi-service commands (Option 3):

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

**Single image setup (Options 1 & 2):**

- **Combined Image**: Both frontend and backend in one container using multi-stage build
- **Frontend**: React + Vite app built and served by nginx on port 80
- **Backend**: NestJS app running on port 3000 (internal) with built TypeScript
- **SMTP Server**: Available on port 2525 for email testing
- **Process Management**: Supervisor manages both nginx and Node.js processes
- **Reverse Proxy**: Nginx proxies `/api/` requests to internal backend
- **Health Checks**: Built-in health monitoring with `/app/healthcheck.sh`
- **Security**: Uses Alpine Linux base image and optimized for production
- **File Persistence**: Email data saved to `/data` directory (gitignored)

**Multi-service setup (Option 3):**

- **Backend Container**:
  - NestJS application with multi-stage build (base, development, build, production)
  - Node.js 18 Alpine base image for smaller size
  - Exposes ports 3000 (API) and 2525 (SMTP)
  - Non-root user (nestjs:1001) for security
  - Production dependencies only in final stage
  - Built TypeScript application in `/dist` directory
  - Health check support with wget
- **Frontend Container**:
  - React + Vite application with multi-stage build
  - Served by nginx in production
  - Custom nginx configuration for SPA routing
  - Health check support with curl
  - Static assets optimized for production
- **Networking**: Services communicate via Docker network
- **Development**: Hot reloading support with volume mounts
- **Security**: Non-root users in production containers

### File Structure

```
├── packages/
│   ├── backend/
│   │   ├── Dockerfile              # Multi-stage backend Dockerfile (dev/build/prod)
│   │   ├── src/                    # Backend source code
│   │   └── data/                   # Email data storage (gitignored)
│   └── frontend/
│       ├── Dockerfile              # Multi-stage frontend Dockerfile (dev/build/prod)
│       ├── nginx.conf              # Frontend nginx config for production
│       └── src/                    # Frontend source code
├── Dockerfile                      # Single unified image (frontend + backend)
├── docker-compose.yml              # Multi-service production setup
├── docker-compose.override.yml     # Multi-service development overrides
├── docker-compose.single.yml       # Single image deployment (uses Docker Hub)
├── docker.sh                       # Helper script for all Docker operations
├── nginx-single.conf               # Nginx config for unified image
├── supervisord.conf                # Process manager config for unified image
├── start.sh                        # Startup script for unified image
├── healthcheck.sh                  # Health check script
└── .dockerignore                   # Docker build ignore patterns
```

### Docker Build Features

**Backend Dockerfile (`packages/backend/Dockerfile`):**

- **Multi-stage build**: Optimized for different environments (development, build, production)
- **Security**: Non-root user (nestjs:1001) in production stage
- **Health checks**: wget installed for container health monitoring
- **Port exposure**: 3000 (API) and 2525 (SMTP server)
- **Dependency optimization**: Production-only dependencies in final stage
- **Alpine Linux**: Smaller image size and better security

**Frontend Dockerfile (`packages/frontend/Dockerfile`):**

- **Multi-stage build**: Development, build, and nginx production stages
- **SPA support**: Custom nginx configuration for React Router
- **Health checks**: curl installed for monitoring
- **Static optimization**: Built assets served efficiently by nginx

**Unified Dockerfile (`Dockerfile`):**

- **Combined build**: Builds both frontend and backend in single image
- **Process management**: Supervisor coordinates nginx and Node.js
- **Reverse proxy**: Nginx handles routing and API proxying
- **Health monitoring**: Comprehensive health check script

### When to Use Which Setup

**Use Simple Docker Run (Option 1) when:**

- You need quick testing or demos
- You want minimal setup with single command
- You don't need docker-compose features
- You're running on systems without docker-compose
- You prefer direct Docker commands
- You want instant deployment with pre-built image

**Use Single image setup (Option 2) when:**

- You want simpler deployment with docker-compose
- You have resource constraints
- You need everything in one container
- You're deploying to platforms that prefer single containers
- You want both pre-built and local build options
- You need health checks and restart policies

**Use Multi-service setup (Option 3) when:**

- You need to scale frontend and backend independently
- You want to deploy services separately
- You need development hot reloading
- You prefer microservices architecture
- You want to build from source locally
- You need to customize the build process

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software without any restrictions.
