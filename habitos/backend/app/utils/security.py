"""
Security utilities and middleware for HabitOS
"""

import time
import hashlib
import logging
from functools import wraps
from flask import request, jsonify, g, current_app
from flask_cors import CORS
import redis
import re

logger = logging.getLogger(__name__)

class RateLimiter:
    """Rate limiting utility using Redis"""
    
    def __init__(self, app):
        self.app = app
        self.redis_client = None
        self._init_redis()
    
    def _init_redis(self):
        """Initialize Redis connection for rate limiting"""
        if self.app.config.get('REDIS_URL'):
            try:
                self.redis_client = redis.from_url(
                    self.app.config['REDIS_URL'],
                    password=self.app.config.get('REDIS_PASSWORD'),
                    db=self.app.config.get('REDIS_DB', 0),
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2
                )
                self.redis_client.ping()
                logger.info("Redis connection established for rate limiting")
            except Exception as e:
                # Only log warning if we're in a request context or during app startup
                logger.warning(f"Redis connection for rate limiting failed: {e}")
                self.redis_client = None
    
    def _get_client_ip(self):
        """Get client IP address considering proxies"""
        if request.headers.get('X-Forwarded-For'):
            return request.headers.get('X-Forwarded-For').split(',')[0].strip()
        elif request.headers.get('X-Real-IP'):
            return request.headers.get('X-Real-IP')
        else:
            return request.remote_addr
    
    def _get_user_identifier(self):
        """Get user identifier for rate limiting"""
        # Try to get user ID from JWT token if available
        if hasattr(g, 'user_id'):
            return f"user:{g.user_id}"
        
        # Fall back to IP address
        return f"ip:{self._get_client_ip()}"
    
    def is_rate_limited(self, key_prefix, max_requests, window_seconds):
        """Check if request is rate limited"""
        if not self.redis_client:
            return False
        
        try:
            identifier = self._get_user_identifier()
            key = f"rate_limit:{key_prefix}:{identifier}"
            current_time = int(time.time())
            
            # Get current request count
            pipe = self.redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, current_time - window_seconds)
            pipe.zadd(key, {str(current_time): current_time})
            pipe.zcard(key)
            pipe.expire(key, window_seconds)
            results = pipe.execute()
            
            current_requests = results[2]
            
            return current_requests > max_requests
            
        except Exception as e:
            logger.error(f"Rate limiting check failed: {e}")
            return False
    
    def get_remaining_requests(self, key_prefix, max_requests, window_seconds):
        """Get remaining requests for the current window"""
        if not self.redis_client:
            return max_requests
        
        try:
            identifier = self._get_user_identifier()
            key = f"rate_limit:{key_prefix}:{identifier}"
            current_time = int(time.time())
            
            # Clean old entries and get current count
            self.redis_client.zremrangebyscore(key, 0, current_time - window_seconds)
            current_requests = self.redis_client.zcard(key)
            
            return max(0, max_requests - current_requests)
            
        except Exception as e:
            logger.error(f"Failed to get remaining requests: {e}")
            return max_requests

class SecurityMiddleware:
    """Security middleware for request processing"""
    
    def __init__(self, app):
        self.app = app
        self.rate_limiter = RateLimiter(app)
        self._setup_cors()
        self._setup_security_headers()
    
    def _setup_cors(self):
        """Setup CORS configuration"""
        if self.app.config.get('CORS_ORIGINS'):
            CORS(self.app, origins=self.app.config['CORS_ORIGINS'])
    
    def _setup_security_headers(self):
        """Setup security headers"""
        @self.app.after_request
        def add_security_headers(response):
            # Security headers
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
            
            # Remove server information
            response.headers.pop('Server', None)
            
            return response
    
    def validate_input(self, data, rules):
        """Validate input data against security rules"""
        if not data:
            return True, None
        
        for field, rule in rules.items():
            if field in data:
                value = data[field]
                
                # Check for SQL injection patterns
                if rule.get('no_sql_injection'):
                    sql_patterns = [
                        r'(\b(union|select|insert|update|delete|drop|create|alter)\b)',
                        r'(\b(or|and)\b\s+\d+\s*[=<>])',
                        r'(\b(union|select|insert|update|delete|drop|create|alter)\b\s+.*\b(union|select|insert|update|delete|drop|create|alter)\b)',
                        r'(\b(union|select|insert|update|delete|drop|create|alter)\b\s+.*\b(union|select|insert|update|delete|drop|create|alter)\b)',
                        r'(\b(union|select|insert|update|delete|drop|create|alter)\b\s+.*\b(union|select|insert|update|delete|drop|create|alter)\b)'
                    ]
                    
                    for pattern in sql_patterns:
                        if re.search(pattern, str(value), re.IGNORECASE):
                            return False, f"Potential SQL injection detected in field {field}"
                
                # Check for XSS patterns
                if rule.get('no_xss'):
                    xss_patterns = [
                        r'<script[^>]*>.*?</script>',
                        r'javascript:',
                        r'on\w+\s*=',
                        r'<iframe[^>]*>',
                        r'<object[^>]*>',
                        r'<embed[^>]*>'
                    ]
                    
                    for pattern in xss_patterns:
                        if re.search(pattern, str(value), re.IGNORECASE):
                            return False, f"Potential XSS detected in field {field}"
                
                # Check length limits
                if rule.get('max_length') and len(str(value)) > rule['max_length']:
                    return False, f"Field {field} exceeds maximum length of {rule['max_length']}"
                
                # Check for required fields
                if rule.get('required') and not value:
                    return False, f"Field {field} is required"
        
        return True, None

def rate_limit(max_requests, window_seconds, key_prefix='default'):
    """Decorator for rate limiting endpoints"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_app.config.get('ENABLE_RATE_LIMITING', True):
                return f(*args, **kwargs)
            
            rate_limiter = RateLimiter(current_app)
            
            if rate_limiter.is_rate_limited(key_prefix, max_requests, window_seconds):
                remaining = rate_limiter.get_remaining_requests(key_prefix, max_requests, window_seconds)
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'message': f'Too many requests. Try again in {window_seconds} seconds.',
                    'remaining_requests': remaining,
                    'reset_time': int(time.time()) + window_seconds
                }), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_authentication(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(g, 'user_id'):
            return jsonify({
                'error': 'Authentication required',
                'message': 'Please log in to access this resource'
            }), 401
        return f(*args, **kwargs)
    return decorated_function

def validate_json_input(rules):
    """Decorator to validate JSON input"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({
                    'error': 'Invalid content type',
                    'message': 'Request must be JSON'
                }), 400
            
            data = request.get_json()
            security = SecurityMiddleware(current_app)
            is_valid, error_message = security.validate_input(data, rules)
            
            if not is_valid:
                return jsonify({
                    'error': 'Validation failed',
                    'message': error_message
                }), 400
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def sanitize_input(data):
    """Sanitize input data"""
    if isinstance(data, str):
        # Remove potentially dangerous characters
        data = re.sub(r'[<>"\']', '', data)
        # Limit length
        if len(data) > 10000:  # 10KB limit
            data = data[:10000]
    elif isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    
    return data

def generate_csrf_token():
    """Generate CSRF token"""
    import secrets
    return secrets.token_hex(32)

def verify_csrf_token(token, stored_token):
    """Verify CSRF token"""
    if not token or not stored_token:
        return False
    return token == stored_token

# Common validation rules
USER_INPUT_RULES = {
    'email': {
        'required': True,
        'max_length': 255,
        'no_sql_injection': True,
        'no_xss': True
    },
    'username': {
        'required': True,
        'max_length': 80,
        'no_sql_injection': True,
        'no_xss': True
    },
    'password': {
        'required': True,
        'max_length': 128,
        'no_sql_injection': True
    },
    'title': {
        'required': True,
        'max_length': 255,
        'no_sql_injection': True,
        'no_xss': True
    },
    'content': {
        'max_length': 10000,
        'no_sql_injection': True,
        'no_xss': True
    }
} 