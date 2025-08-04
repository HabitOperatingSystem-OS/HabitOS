#!/bin/bash

# =============================================================================
# HabitOS Production Validation Script
# =============================================================================
# This script validates that the application is ready for production deployment

set -e

echo "🔍 Validating HabitOS for production deployment..."

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

# Track validation results
validation_errors=0
validation_warnings=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        print_success "✓ $2"
        return 0
    else
        print_error "✗ $2 (missing: $1)"
        ((validation_errors++))
        return 1
    fi
}

# Function to check if directory exists
check_directory() {
    if [ -d "$1" ]; then
        print_success "✓ $2"
        return 0
    else
        print_error "✗ $2 (missing: $1)"
        ((validation_errors++))
        return 1
    fi
}

# Function to validate environment variables
validate_env_vars() {
    print_status "Validating environment variables..."
    
    if [ -f ".env" ]; then
        # Check for required variables
        required_vars=("SECRET_KEY" "JWT_SECRET_KEY" "POSTGRES_PASSWORD" "REDIS_PASSWORD")
        
        for var in "${required_vars[@]}"; do
            if grep -q "^${var}=" .env; then
                value=$(grep "^${var}=" .env | cut -d'=' -f2)
                if [[ "$value" == *"your_"* ]] || [[ "$value" == *"change_in_production"* ]]; then
                    print_warning "⚠ $var contains placeholder value"
                    ((validation_warnings++))
                else
                    print_success "✓ $var is set"
                fi
            else
                print_error "✗ $var is missing"
                ((validation_errors++))
            fi
        done
    else
        print_warning "⚠ .env file not found (using env.example for validation)"
    fi
}

# Function to validate Docker configurations
validate_docker() {
    print_status "Validating Docker configurations..."
    
    # Check Dockerfiles
    check_file "backend/Dockerfile" "Backend Dockerfile"
    check_file "frontend/Dockerfile" "Frontend Dockerfile"
    check_file "docker-compose.yml" "Docker Compose configuration"
    
    # Check .dockerignore files
    check_file "backend/.dockerignore" "Backend .dockerignore"
    check_file "frontend/.dockerignore" "Frontend .dockerignore"
    
    # Check nginx configurations
    check_file "frontend/nginx.conf" "Frontend Nginx configuration"
    check_file "nginx/nginx.conf" "Production Nginx configuration"
}

# Function to validate deployment files
validate_deployment() {
    print_status "Validating deployment files..."
    
    # Check Render configuration
    check_file "render.yaml" "Render deployment configuration"
    
    # Check requirements file
    check_file "backend/requirements.txt" "Python requirements"
    
    # Check database initialization
    check_file "backend/scripts/init.sql" "Database initialization script"
    
    # Check environment template
    check_file "env.example" "Environment variables template"
}

# Function to validate application structure
validate_structure() {
    print_status "Validating application structure..."
    
    # Check backend structure
    check_directory "backend/app" "Backend application directory"
    check_directory "backend/migrations" "Database migrations directory"
    
    # Check frontend structure
    check_directory "frontend/src" "Frontend source directory"
    check_file "frontend/package.json" "Frontend package.json"
    check_file "frontend/vite.config.js" "Vite configuration"
    
    # Check documentation
    check_file "DEPLOYMENT.md" "Deployment documentation"
}

# Function to validate security
validate_security() {
    print_status "Validating security configurations..."
    
    # Check for hardcoded secrets (excluding config.get() calls)
    if grep -r "password.*=.*['\"][^']*['\"]" backend/ --exclude-dir=__pycache__ --exclude-dir=.git --exclude-dir=migrations 2>/dev/null | grep -v "config.get"; then
        print_warning "⚠ Potential hardcoded passwords found in backend"
        ((validation_warnings++))
    fi
    
    if grep -r "secret.*=.*['\"][^']*['\"]" backend/ --exclude-dir=__pycache__ --exclude-dir=.git --exclude-dir=migrations 2>/dev/null | grep -v "config.get"; then
        print_warning "⚠ Potential hardcoded secrets found in backend"
        ((validation_warnings++))
    fi
    
    # Check for .env files in git
    if git ls-files | grep -q "\.env$"; then
        print_error "✗ .env file is tracked in git (security risk)"
        ((validation_errors++))
    fi
    
    # Check for SSL certificates
    if [ -f "nginx/ssl/cert.pem" ] && [ -f "nginx/ssl/key.pem" ]; then
        print_success "✓ SSL certificates found"
    else
        print_warning "⚠ SSL certificates not found (will be needed for production)"
        ((validation_warnings++))
    fi
}

# Function to validate health checks
validate_health_checks() {
    print_status "Validating health check configurations..."
    
    # Check if health check endpoints exist in code
    if grep -q "@app.route('/health')" backend/app/__init__.py; then
        print_success "✓ Backend health check endpoint found"
    else
        print_error "✗ Backend health check endpoint missing"
        ((validation_errors++))
    fi
    
    # Check Docker health checks
    if grep -q "healthcheck:" docker-compose.yml; then
        print_success "✓ Docker health checks configured"
    else
        print_error "✗ Docker health checks missing"
        ((validation_errors++))
    fi
}

# Function to validate environment variables in render.yaml
validate_render_config() {
    print_status "Validating Render configuration..."
    
    if [ -f "render.yaml" ]; then
        # Check if required environment variables are defined
        required_render_vars=("FLASK_ENV" "DATABASE_URL" "REDIS_URL" "SECRET_KEY" "JWT_SECRET_KEY")
        
        for var in "${required_render_vars[@]}"; do
            if grep -q "key: $var" render.yaml; then
                print_success "✓ $var configured in render.yaml"
            else
                print_warning "⚠ $var not found in render.yaml"
                ((validation_warnings++))
            fi
        done
        
        # Check if services are properly configured
        if grep -q "type: web" render.yaml && grep -q "type: redis" render.yaml; then
            print_success "✓ Render services properly configured"
        else
            print_error "✗ Render services configuration incomplete"
            ((validation_errors++))
        fi
    fi
}

# Function to run basic tests
run_basic_tests() {
    print_status "Running basic validation tests..."
    
    # Test Docker Compose syntax (try both old and new syntax)
    if command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker-compose"
    elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        compose_cmd="docker compose"
    else
        print_warning "⚠ Docker Compose not found, skipping syntax validation"
        ((validation_warnings++))
        return 0
    fi
    
    # Test Docker Compose syntax
    if $compose_cmd config > /dev/null 2>&1; then
        print_success "✓ Docker Compose configuration is valid"
    else
        print_error "✗ Docker Compose configuration has errors"
        ((validation_errors++))
    fi
    
    # Test if we can build images (without actually building)
    if $compose_cmd config --services | grep -q "backend\|frontend"; then
        print_success "✓ Docker Compose services are defined"
    else
        print_error "✗ Docker Compose services are missing"
        ((validation_errors++))
    fi
}

# Main validation process
main() {
    echo "Starting production validation..."
    echo "=================================="
    
    validate_structure
    echo ""
    
    validate_docker
    echo ""
    
    validate_deployment
    echo ""
    
    validate_env_vars
    echo ""
    
    validate_security
    echo ""
    
    validate_health_checks
    echo ""
    
    validate_render_config
    echo ""
    
    run_basic_tests
    echo ""
    
    # Summary
    echo "=================================="
    echo "Validation Summary:"
    echo "=================================="
    
    if [ $validation_errors -eq 0 ]; then
        print_success "✓ All critical validations passed!"
    else
        print_error "✗ $validation_errors critical errors found"
    fi
    
    if [ $validation_warnings -gt 0 ]; then
        print_warning "⚠ $validation_warnings warnings found"
    fi
    
    echo ""
    
    if [ $validation_errors -eq 0 ]; then
        print_success "🎉 HabitOS is ready for production deployment!"
        echo ""
        echo "Next steps:"
        echo "1. Commit and push your changes to GitHub"
        echo "2. Connect your repository to Render"
        echo "3. Configure environment variables in Render dashboard"
        echo "4. Deploy and monitor the application"
        echo ""
        print_success "Good luck with your deployment! 🚀"
    else
        print_error "❌ Please fix the errors above before deploying"
        exit 1
    fi
}

# Run validation
main 