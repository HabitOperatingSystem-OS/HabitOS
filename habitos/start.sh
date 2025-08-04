#!/bin/bash

# =============================================================================
# HabitOS Quick Start Script
# =============================================================================
# This script sets up and starts the HabitOS application for local development

set -e

echo "🚀 Starting HabitOS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f env.example ]; then
        cp env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your configuration before continuing"
        echo "Press Enter to continue or Ctrl+C to exit and edit .env file..."
        read
    else
        print_error "env.example file not found. Please create a .env file manually."
        exit 1
    fi
fi

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down --remove-orphans

# Build images
print_status "Building Docker images..."
docker-compose build --no-cache

# Start services
print_status "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if services are healthy
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U habitos_user > /dev/null 2>&1; then
    print_success "PostgreSQL is ready"
else
    print_warning "PostgreSQL is not ready yet, waiting..."
    sleep 10
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is ready"
else
    print_warning "Redis is not ready yet, waiting..."
    sleep 5
fi

# Run database migrations
print_status "Running database migrations..."
if docker-compose exec -T backend flask db upgrade; then
    print_success "Database migrations completed"
else
    print_warning "Database migrations failed, but continuing..."
fi

# Show service status
print_status "Service status:"
docker-compose ps

# Show URLs
echo ""
print_success "🎉 HabitOS is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001"
echo "🗄️  PostgreSQL: localhost:5432"
echo "⚡ Redis: localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  Rebuild: docker-compose build --no-cache"
echo ""
print_warning "Note: It may take a few minutes for all services to be fully ready."
echo "Check the logs with 'docker-compose logs -f' if you encounter any issues." 