#!/bin/bash

# Docker management script for Fake SMTP Server

set -e

case "$1" in
  "build")
    echo "Building Docker images..."
    docker-compose build
    ;;
  "up")
    echo "Starting services in production mode..."
    docker-compose up -d
    ;;
  "dev")
    echo "Starting services in development mode..."
    docker-compose up
    ;;
  "down")
    echo "Stopping services..."
    docker-compose down
    ;;
  "logs")
    echo "Showing logs..."
    docker-compose logs -f
    ;;
  "clean")
    echo "Cleaning up containers and volumes..."
    docker-compose down -v
    docker system prune -f
    ;;
  "rebuild")
    echo "Rebuilding and starting services..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    ;;
  "single")
    echo "Building and starting single unified image..."
    docker-compose -f docker-compose.single.yml up --build -d
    ;;
  "single-dev")
    echo "Building and starting single unified image (attached)..."
    docker-compose -f docker-compose.single.yml up --build
    ;;
  "single-down")
    echo "Stopping single image..."
    docker-compose -f docker-compose.single.yml down
    ;;
  "single-logs")
    echo "Showing single image logs..."
    docker-compose -f docker-compose.single.yml logs -f
    ;;
  *)
    echo "Usage: $0 {build|up|dev|down|logs|clean|rebuild|single|single-dev|single-down|single-logs}"
    echo ""
    echo "Multi-service commands:"
    echo "  build      - Build Docker images"
    echo "  up         - Start services in production mode (detached)"
    echo "  dev        - Start services in development mode"
    echo "  down       - Stop all services"
    echo "  logs       - Show service logs"
    echo "  clean      - Remove containers, volumes, and unused images"
    echo "  rebuild    - Clean rebuild and start"
    echo ""
    echo "Single image commands:"
    echo "  single     - Build and start unified image (detached)"
    echo "  single-dev - Build and start unified image (attached)"
    echo "  single-down - Stop unified image"
    echo "  single-logs - Show unified image logs"
    exit 1
    ;;
esac 