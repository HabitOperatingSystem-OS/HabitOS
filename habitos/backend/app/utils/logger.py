"""
Logging configuration and utilities for HabitOS
"""

import os
import logging
import logging.handlers
from datetime import datetime
from flask import request, g, has_app_context
import json

class RequestFormatter(logging.Formatter):
    """Custom formatter that includes request information"""
    
    def format(self, record):
        # Add request information if available
        if has_app_context() and hasattr(g, 'request_id'):
            record.request_id = g.request_id
        else:
            record.request_id = 'N/A'
            
        if has_app_context() and request:
            record.remote_addr = request.remote_addr
            record.method = request.method
            record.url = request.url
            record.user_agent = request.headers.get('User-Agent', 'N/A')
        else:
            record.remote_addr = 'N/A'
            record.method = 'N/A'
            record.url = 'N/A'
            record.user_agent = 'N/A'
            
        return super().format(record)

def setup_logging(app):
    """Setup logging configuration for the application"""
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.dirname(app.config['LOG_FILE'])
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Set log level
    log_level = getattr(logging, app.config['LOG_LEVEL'].upper(), logging.INFO)
    
    # Create formatters
    detailed_formatter = RequestFormatter(
        '%(asctime)s [%(levelname)s] [%(request_id)s] %(remote_addr)s - '
        '%(method)s %(url)s - %(name)s:%(lineno)d - %(message)s'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s [%(levelname)s] %(name)s:%(lineno)d - %(message)s'
    )
    
    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        app.config['LOG_FILE'],
        maxBytes=app.config['LOG_MAX_SIZE'],
        backupCount=app.config['LOG_BACKUP_COUNT']
    )
    file_handler.setFormatter(detailed_formatter)
    file_handler.setLevel(log_level)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(simple_formatter)
    console_handler.setLevel(log_level)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    # Configure Flask logger
    app.logger.handlers.clear()  # Remove default handlers
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(log_level)
    
    # Configure SQLAlchemy logger
    sqlalchemy_logger = logging.getLogger('sqlalchemy.engine')
    sqlalchemy_logger.setLevel(logging.WARNING)
    
    # Configure Werkzeug logger
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.setLevel(logging.WARNING)
    
    return app.logger

def log_request_info():
    """Log request information for debugging"""
    if has_app_context() and request:
        logger = logging.getLogger(__name__)
        logger.info(
            f"Request: {request.method} {request.url} - "
            f"IP: {request.remote_addr} - "
            f"User-Agent: {request.headers.get('User-Agent', 'N/A')}"
        )

def log_error(error, context=None):
    """Log error with context information"""
    logger = logging.getLogger(__name__)
    
    error_data = {
        'error_type': type(error).__name__,
        'error_message': str(error),
        'timestamp': datetime.utcnow().isoformat(),
        'context': context or {}
    }
    
    if has_app_context() and request:
        error_data['request'] = {
            'method': request.method,
            'url': request.url,
            'remote_addr': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', 'N/A')
        }
    
    logger.error(f"Application error: {json.dumps(error_data, indent=2)}")

def log_user_action(user_id, action, details=None):
    """Log user actions for audit trail"""
    logger = logging.getLogger('user_actions')
    
    action_data = {
        'user_id': user_id,
        'action': action,
        'timestamp': datetime.utcnow().isoformat(),
        'details': details or {}
    }
    
    if has_app_context() and request:
        action_data['request'] = {
            'method': request.method,
            'url': request.url,
            'remote_addr': request.remote_addr
        }
    
    logger.info(f"User action: {json.dumps(action_data, indent=2)}")

def log_performance(operation, duration, details=None):
    """Log performance metrics"""
    logger = logging.getLogger('performance')
    
    perf_data = {
        'operation': operation,
        'duration_ms': round(duration * 1000, 2),
        'timestamp': datetime.utcnow().isoformat(),
        'details': details or {}
    }
    
    logger.info(f"Performance metric: {json.dumps(perf_data, indent=2)}")

# Context manager for timing operations
class PerformanceTimer:
    """Context manager for timing operations"""
    
    def __init__(self, operation, logger=None):
        self.operation = operation
        self.logger = logger or logging.getLogger('performance')
        self.start_time = None
    
    def __enter__(self):
        self.start_time = datetime.utcnow()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            duration = (datetime.utcnow() - self.start_time).total_seconds()
            log_performance(self.operation, duration) 