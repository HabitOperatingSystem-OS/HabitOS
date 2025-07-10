#!/bin/bash

# =============================================================================
# HabitOS Production Deployment Script
# =============================================================================
# This script sets up the production environment for HabitOS
# Run this script on your production server

set -e  # Exit on any error

echo "🚀 Starting HabitOS Production Deployment..."

# =============================================================================
# Environment Check
# =============================================================================
echo "📋 Checking environment..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root"
   exit 1
fi

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "🐍 Python version: $python_version"

# Check if pipenv is installed
if ! command -v pipenv &> /dev/null; then
    echo "❌ pipenv is not installed. Please install it first."
    exit 1
fi

# =============================================================================
# Environment Variables Setup
# =============================================================================
echo "🔧 Setting up environment variables..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "Please copy .env.production.example to .env.production and configure it."
    exit 1
fi

# Create logs directory
echo "📁 Creating logs directory..."
sudo mkdir -p /var/log/habitos
sudo chown $USER:$USER /var/log/habitos
sudo chmod 755 /var/log/habitos

# Create uploads directory
echo "📁 Creating uploads directory..."
sudo mkdir -p /var/habitos/uploads
sudo chown $USER:$USER /var/habitos/uploads
sudo chmod 755 /var/habitos/uploads

# =============================================================================
# Dependencies Installation
# =============================================================================
echo "📦 Installing dependencies..."

# Install system dependencies
if command -v apt-get &> /dev/null; then
    echo "📦 Installing system packages (Ubuntu/Debian)..."
    sudo apt-get update
    sudo apt-get install -y python3-dev python3-pip postgresql-client redis-server
elif command -v yum &> /dev/null; then
    echo "📦 Installing system packages (CentOS/RHEL)..."
    sudo yum update -y
    sudo yum install -y python3-devel python3-pip postgresql redis
elif command -v brew &> /dev/null; then
    echo "📦 Installing system packages (macOS)..."
    brew install postgresql redis
else
    echo "⚠️  Please install PostgreSQL and Redis manually for your system."
fi

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pipenv install --deploy

# =============================================================================
# Database Setup
# =============================================================================
echo "🗄️  Setting up database..."

# Check database connection
echo "🔍 Testing database connection..."
if pipenv run python -c "
from app import create_app
app = create_app('production')
with app.app_context():
    from app import db
    db.engine.execute('SELECT 1')
    print('✅ Database connection successful!')
"; then
    echo "✅ Database connection verified"
else
    echo "❌ Database connection failed!"
    echo "Please check your DATABASE_URL in .env.production"
    exit 1
fi

# Run database migrations
echo "🔄 Running database migrations..."
pipenv run alembic upgrade head

# =============================================================================
# Security Checks
# =============================================================================
echo "🔒 Running security checks..."

# Check for default secrets
if grep -q "dev-secret-key-change-in-production" .env.production; then
    echo "❌ SECRET_KEY is still set to default value!"
    exit 1
fi

if grep -q "jwt-secret-change-in-production" .env.production; then
    echo "❌ JWT_SECRET_KEY is still set to default value!"
    exit 1
fi

# Check for weak passwords
if grep -q "password" .env.production | grep -v "MAIL_PASSWORD"; then
    echo "⚠️  Warning: Check for weak passwords in .env.production"
fi

echo "✅ Security checks passed"

# =============================================================================
# Application Test
# =============================================================================
echo "🧪 Testing application..."

# Test application startup
echo "🔍 Testing application startup..."
if timeout 30s pipenv run python -c "
from app import create_app
app = create_app('production')
print('✅ Application startup successful!')
"; then
    echo "✅ Application test passed"
else
    echo "❌ Application test failed!"
    exit 1
fi

# =============================================================================
# Health Check
# =============================================================================
echo "🏥 Running health check..."

# Start application in background for health check
echo "🚀 Starting application for health check..."
pipenv run python -c "
from app import create_app
app = create_app('production')
app.run(host='0.0.0.0', port=5000, debug=False)
" &
APP_PID=$!

# Wait for application to start
sleep 5

# Test health endpoint
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed!"
    kill $APP_PID 2>/dev/null || true
    exit 1
fi

# Stop test application
kill $APP_PID 2>/dev/null || true

# =============================================================================
# Service Setup (Optional)
# =============================================================================
echo "🔧 Setting up system service..."

# Create systemd service file
sudo tee /etc/systemd/system/habitos.service > /dev/null << EOF
[Unit]
Description=HabitOS API
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=PATH=$(pwd)/.venv/bin
ExecStart=$(pwd)/.venv/bin/python run.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable habitos
echo "✅ System service configured"

# =============================================================================
# Nginx Setup (Optional)
# =============================================================================
echo "🌐 Setting up Nginx (optional)..."

if command -v nginx &> /dev/null; then
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/habitos > /dev/null << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/habitos /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    echo "✅ Nginx configured"
else
    echo "⚠️  Nginx not installed. Please configure your web server manually."
fi

# =============================================================================
# Final Steps
# =============================================================================
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the service: sudo systemctl start habitos"
echo "2. Check service status: sudo systemctl status habitos"
echo "3. View logs: sudo journalctl -u habitos -f"
echo "4. Test the API: curl http://localhost:5000/api/health"
echo ""
echo "🔒 Security reminders:"
echo "- Ensure your firewall is configured"
echo "- Set up SSL/TLS certificates"
echo "- Regularly update dependencies"
echo "- Monitor logs for suspicious activity"
echo ""
echo "📊 Monitoring:"
echo "- Health check: http://localhost:5000/api/health"
echo "- Detailed health: http://localhost:5000/api/health/detailed"
echo "- Metrics: http://localhost:5000/api/metrics" 