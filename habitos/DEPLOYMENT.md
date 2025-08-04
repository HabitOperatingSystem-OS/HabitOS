# HabitOS Deployment Guide

This guide covers deploying the HabitOS full-stack application using Docker and Docker Compose, with specific instructions for local development and production deployment on Render.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Render Deployment](#render-deployment)
5. [Environment Variables](#environment-variables)
6. [Security Considerations](#security-considerations)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- A PostgreSQL database (for production)
- Redis instance (for production)
- Domain name with SSL certificate (for production)

## Local Development Setup

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd HabitOS

# Copy environment file
cp env.example .env

# Edit environment variables for local development
nano .env
```

### 2. Configure Local Environment

Update the `.env` file with local development settings:

```bash
# Database Configuration
POSTGRES_DB=habitos_dev
POSTGRES_USER=habitos_user
POSTGRES_PASSWORD=dev_password_123

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-change-in-production

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Build and Run

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Database Migrations

```bash
# Run database migrations
docker-compose exec backend flask db upgrade

# Create initial admin user (if needed)
docker-compose exec backend python -c "
from app import create_app
from app.models.user import User
from app import db
app = create_app()
with app.app_context():
    user = User(email='admin@example.com', username='admin')
    user.set_password('admin123')
    db.session.add(user)
    db.session.commit()
"
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Production Deployment

### 1. Production Environment Setup

```bash
# Copy production environment file
cp env.example .env.production

# Edit production environment variables
nano .env.production
```

### 2. Configure Production Environment

Update `.env.production` with secure production values:

```bash
# Generate secure secrets
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)

# Update environment file
FLASK_ENV=production
SECRET_KEY=your_generated_secret_key
JWT_SECRET_KEY=your_generated_jwt_secret
POSTGRES_PASSWORD=your_generated_postgres_password
REDIS_PASSWORD=your_generated_redis_password

# Production database (external)
DATABASE_URL=postgresql://user:password@your-db-host:5432/habitos

# Production Redis (external)
REDIS_URL=redis://:password@your-redis-host:6379/0

# Production CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. SSL Certificate Setup

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"

# For production, use Let's Encrypt or your SSL provider
```

### 4. Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.yml --env-file .env.production build

# Start production services
docker-compose -f docker-compose.yml --env-file .env.production up -d

# Run database migrations
docker-compose -f docker-compose.yml --env-file .env.production exec backend flask db upgrade
```

### 5. Production with Reverse Proxy

```bash
# Start with nginx reverse proxy
docker-compose -f docker-compose.yml --env-file .env.production --profile production up -d
```

## Render Deployment

### 1. Render Service Configuration

Create a `render.yaml` file in your repository root:

```yaml
services:
  - type: web
    name: habitos-backend
    env: python
    plan: starter
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn --bind 0.0.0.0:$PORT run:app
    envVars:
      - key: FLASK_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: habitos-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: habitos-redis
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: JWT_SECRET_KEY
        generateValue: true

  - type: web
    name: habitos-frontend
    env: static
    plan: starter
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        value: https://habitos-backend.onrender.com

databases:
  - name: habitos-db
    databaseName: habitos
    user: habitos_user
    plan: starter

services:
  - type: redis
    name: habitos-redis
    plan: starter
    maxmemoryPolicy: allkeys-lru
```

### 2. Render Environment Variables

Set these environment variables in your Render dashboard:

**Backend Service:**

- `FLASK_ENV`: production
- `SECRET_KEY`: (auto-generated)
- `JWT_SECRET_KEY`: (auto-generated)
- `GEMINI_API_KEY`: your_gemini_api_key
- `MAIL_USERNAME`: your_email
- `MAIL_PASSWORD`: your_app_password
- `GOOGLE_CLIENT_ID`: your_google_client_id
- `GOOGLE_CLIENT_SECRET`: your_google_client_secret
- `CORS_ORIGINS`: https://your-frontend-domain.onrender.com

**Frontend Service:**

- `VITE_API_URL`: https://your-backend-service.onrender.com

### 3. Deploy to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service for the backend
3. Create a new Static Site for the frontend
4. Create a PostgreSQL database
5. Create a Redis instance
6. Configure environment variables
7. Deploy

### 4. Custom Domain Setup

1. Add your custom domain in Render
2. Configure DNS records
3. Enable SSL certificate
4. Update CORS origins in backend environment variables

## Environment Variables

### Required Variables

| Variable         | Description                  | Example                               |
| ---------------- | ---------------------------- | ------------------------------------- |
| `SECRET_KEY`     | Flask secret key             | `openssl rand -hex 32`                |
| `JWT_SECRET_KEY` | JWT signing key              | `openssl rand -hex 32`                |
| `DATABASE_URL`   | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL`      | Redis connection string      | `redis://:pass@host:6379/0`           |

### Optional Variables

| Variable           | Description            | Default                 |
| ------------------ | ---------------------- | ----------------------- |
| `FLASK_ENV`        | Flask environment      | `development`           |
| `GEMINI_API_KEY`   | Google Gemini API key  | None                    |
| `MAIL_USERNAME`    | Email username         | None                    |
| `MAIL_PASSWORD`    | Email password         | None                    |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | None                    |
| `CORS_ORIGINS`     | Allowed origins        | `http://localhost:3000` |

## Security Considerations

### 1. Secrets Management

- Never commit secrets to version control
- Use environment variables for all secrets
- Generate strong, random secrets
- Rotate secrets regularly

### 2. Database Security

- Use strong passwords
- Enable SSL connections
- Restrict network access
- Regular backups

### 3. Application Security

- Enable HTTPS in production
- Set secure headers
- Implement rate limiting
- Validate all inputs
- Use prepared statements

### 4. Container Security

- Run containers as non-root users
- Keep base images updated
- Scan for vulnerabilities
- Use minimal base images

## Monitoring and Logging

### 1. Application Logs

```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

### 2. Health Checks

```bash
# Check service health
docker-compose ps

# Test health endpoints
curl http://localhost:5001/health
curl http://localhost:3000/health
```

### 3. Performance Monitoring

- Enable Sentry for error tracking
- Use New Relic for performance monitoring
- Monitor database performance
- Set up alerting

## Troubleshooting

### Common Issues

1. **Database Connection Errors**

   ```bash
   # Check database status
   docker-compose exec postgres pg_isready -U habitos_user

   # Check database logs
   docker-compose logs postgres
   ```

2. **Backend Startup Issues**

   ```bash
   # Check backend logs
   docker-compose logs backend

   # Run migrations manually
   docker-compose exec backend flask db upgrade
   ```

3. **Frontend Build Issues**

   ```bash
   # Rebuild frontend
   docker-compose build --no-cache frontend

   # Check build logs
   docker-compose logs frontend
   ```

4. **Network Issues**
   ```bash
   # Check network connectivity
   docker-compose exec backend ping postgres
   docker-compose exec frontend ping backend
   ```

### Performance Optimization

1. **Database Optimization**

   - Enable connection pooling
   - Add database indexes
   - Monitor slow queries

2. **Application Optimization**

   - Enable caching
   - Optimize static assets
   - Use CDN for static files

3. **Container Optimization**
   - Use multi-stage builds
   - Minimize image size
   - Optimize layer caching

### Backup and Recovery

```bash
# Database backup
docker-compose exec postgres pg_dump -U habitos_user habitos > backup.sql

# Database restore
docker-compose exec -T postgres psql -U habitos_user habitos < backup.sql

# Volume backup
docker run --rm -v habitos_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Support

For additional support:

1. Check the application logs
2. Review the troubleshooting section
3. Check the GitHub issues
4. Contact the development team

---

**Note**: This deployment guide assumes you have basic knowledge of Docker, Docker Compose, and cloud deployment. Adjust the configurations based on your specific requirements and infrastructure.
