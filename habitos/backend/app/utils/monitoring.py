"""
Monitoring and health check utilities for HabitOS
"""

import time
import psutil
import logging
from datetime import datetime, timedelta
from flask import current_app, jsonify
from sqlalchemy import text
import redis
import requests

logger = logging.getLogger(__name__)

class HealthChecker:
    """Health check utility for monitoring system components"""
    
    def __init__(self, app):
        self.app = app
        self.redis_client = None
        self._init_redis()
    
    def _init_redis(self):
        """Initialize Redis connection if configured"""
        if self.app.config.get('REDIS_URL'):
            try:
                self.redis_client = redis.from_url(
                    self.app.config['REDIS_URL'],
                    password=self.app.config.get('REDIS_PASSWORD'),
                    db=self.app.config.get('REDIS_DB', 0),
                    decode_responses=True
                )
                # Test connection
                self.redis_client.ping()
                logger.info("Redis connection established")
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}")
                self.redis_client = None
    
    def check_database(self):
        """Check database connectivity and performance"""
        try:
            from app import db
            
            start_time = time.time()
            
            # Test basic connectivity
            result = db.session.execute(text('SELECT 1'))
            result.fetchone()
            
            # Test query performance
            result = db.session.execute(text('SELECT COUNT(*) FROM users'))
            user_count = result.fetchone()[0]
            
            duration = time.time() - start_time
            
            return {
                'status': 'healthy',
                'response_time_ms': round(duration * 1000, 2),
                'user_count': user_count,
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def check_redis(self):
        """Check Redis connectivity and performance"""
        if not self.redis_client:
            return {
                'status': 'not_configured',
                'message': 'Redis not configured',
                'timestamp': datetime.utcnow().isoformat()
            }
        
        try:
            start_time = time.time()
            
            # Test basic connectivity
            self.redis_client.ping()
            
            # Test write/read performance
            test_key = f"health_check_{int(time.time())}"
            self.redis_client.set(test_key, "test_value", ex=60)
            value = self.redis_client.get(test_key)
            self.redis_client.delete(test_key)
            
            duration = time.time() - start_time
            
            return {
                'status': 'healthy',
                'response_time_ms': round(duration * 1000, 2),
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def check_system_resources(self):
        """Check system resource usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'status': 'healthy',
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available_gb': round(memory.available / (1024**3), 2),
                'disk_percent': disk.percent,
                'disk_free_gb': round(disk.free / (1024**3), 2),
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"System resources check failed: {e}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def check_external_services(self):
        """Check external service dependencies"""
        services = {}
        
        # Check OpenAI API if configured
        if self.app.config.get('OPENAI_API_KEY'):
            try:
                response = requests.get(
                    'https://api.openai.com/v1/models',
                    headers={'Authorization': f"Bearer {self.app.config['OPENAI_API_KEY']}"},
                    timeout=5
                )
                services['openai'] = {
                    'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                    'response_time_ms': round(response.elapsed.total_seconds() * 1000, 2)
                }
            except Exception as e:
                services['openai'] = {
                    'status': 'unhealthy',
                    'error': str(e)
                }
        
        # Check email service if configured
        if self.app.config.get('MAIL_SERVER'):
            try:
                import smtplib
                smtp = smtplib.SMTP(self.app.config['MAIL_SERVER'], self.app.config['MAIL_PORT'])
                smtp.starttls()
                smtp.quit()
                services['email'] = {'status': 'healthy'}
            except Exception as e:
                services['email'] = {
                    'status': 'unhealthy',
                    'error': str(e)
                }
        
        return {
            'services': services,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def get_full_health_report(self):
        """Get comprehensive health report"""
        return {
            'application': {
                'name': 'HabitOS',
                'version': '1.0.0',
                'environment': self.app.config.get('FLASK_ENV', 'unknown'),
                'timestamp': datetime.utcnow().isoformat()
            },
            'database': self.check_database(),
            'redis': self.check_redis(),
            'system': self.check_system_resources(),
            'external_services': self.check_external_services()
        }

class MetricsCollector:
    """Collect and store application metrics"""
    
    def __init__(self, app):
        self.app = app
        self.redis_client = None
        self._init_redis()
    
    def _init_redis(self):
        """Initialize Redis connection for metrics storage"""
        if self.app.config.get('REDIS_URL'):
            try:
                self.redis_client = redis.from_url(
                    self.app.config['REDIS_URL'],
                    password=self.app.config.get('REDIS_PASSWORD'),
                    db=self.app.config.get('REDIS_DB', 0),
                    decode_responses=True
                )
            except Exception as e:
                logger.warning(f"Redis connection for metrics failed: {e}")
    
    def record_request_metric(self, endpoint, method, status_code, duration):
        """Record request metrics"""
        if not self.redis_client:
            return
        
        try:
            timestamp = datetime.utcnow()
            date_key = timestamp.strftime('%Y-%m-%d')
            hour_key = timestamp.strftime('%Y-%m-%d:%H')
            
            # Record request count
            self.redis_client.hincrby(f"requests:{date_key}", f"{method}:{endpoint}", 1)
            self.redis_client.hincrby(f"requests:{hour_key}", f"{method}:{endpoint}", 1)
            
            # Record response times
            self.redis_client.lpush(f"response_times:{date_key}:{method}:{endpoint}", duration)
            self.redis_client.ltrim(f"response_times:{date_key}:{method}:{endpoint}", 0, 999)  # Keep last 1000
            
            # Record status codes
            self.redis_client.hincrby(f"status_codes:{date_key}", str(status_code), 1)
            
        except Exception as e:
            logger.error(f"Failed to record request metric: {e}")
    
    def record_user_action(self, user_id, action, details=None):
        """Record user action metrics"""
        if not self.redis_client:
            return
        
        try:
            timestamp = datetime.utcnow()
            date_key = timestamp.strftime('%Y-%m-%d')
            
            # Record user action
            self.redis_client.hincrby(f"user_actions:{date_key}", action, 1)
            self.redis_client.hincrby(f"user_actions:{date_key}:{user_id}", action, 1)
            
            # Store detailed action data
            action_data = {
                'user_id': user_id,
                'action': action,
                'timestamp': timestamp.isoformat(),
                'details': details or {}
            }
            
            self.redis_client.lpush(f"action_log:{date_key}", str(action_data))
            self.redis_client.ltrim(f"action_log:{date_key}", 0, 9999)  # Keep last 10000
            
        except Exception as e:
            logger.error(f"Failed to record user action: {e}")
    
    def get_metrics_summary(self, days=7):
        """Get metrics summary for the last N days"""
        if not self.redis_client:
            return {}
        
        try:
            summary = {}
            for i in range(days):
                date = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
                
                # Get request counts
                requests = self.redis_client.hgetall(f"requests:{date}")
                summary[date] = {
                    'requests': requests,
                    'status_codes': self.redis_client.hgetall(f"status_codes:{date}"),
                    'user_actions': self.redis_client.hgetall(f"user_actions:{date}")
                }
            
            return summary
        except Exception as e:
            logger.error(f"Failed to get metrics summary: {e}")
            return {}

def create_health_check_blueprint():
    """Create Flask blueprint for health check endpoints"""
    from flask import Blueprint
    
    health_bp = Blueprint('health', __name__)
    
    @health_bp.route('/health')
    def health_check():
        """Basic health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'HabitOS API'
        })
    
    @health_bp.route('/health/detailed')
    def detailed_health_check():
        """Detailed health check with all components"""
        checker = HealthChecker(current_app)
        return jsonify(checker.get_full_health_report())
    
    @health_bp.route('/metrics')
    def get_metrics():
        """Get application metrics"""
        collector = MetricsCollector(current_app)
        return jsonify(collector.get_metrics_summary())
    
    return health_bp 