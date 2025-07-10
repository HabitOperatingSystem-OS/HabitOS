import os
import logging
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class with common settings"""
    
    # =============================================================================
    # Flask Configuration
    # =============================================================================
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    
    # =============================================================================
    # Database Configuration
    # =============================================================================
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://azim:123@localhost:5432/habitos')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Database connection pooling (production)
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': int(os.getenv('DATABASE_POOL_SIZE', 10)),
        'max_overflow': int(os.getenv('DATABASE_MAX_OVERFLOW', 20)),
        'pool_timeout': int(os.getenv('DATABASE_POOL_TIMEOUT', 30)),
        'pool_recycle': int(os.getenv('DATABASE_POOL_RECYCLE', 3600)),
    }
    
    # =============================================================================
    # JWT Configuration
    # =============================================================================
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # =============================================================================
    # Email Configuration
    # =============================================================================
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER')
    
    # =============================================================================
    # AI/OpenAI Configuration
    # =============================================================================
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    OPENAI_MAX_TOKENS = int(os.getenv('OPENAI_MAX_TOKENS', 1000))
    
    # =============================================================================
    # OAuth Configuration
    # =============================================================================
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5000/auth/google/callback')
    
    # =============================================================================
    # Logging Configuration
    # =============================================================================
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/habitos.log')
    LOG_MAX_SIZE = int(os.getenv('LOG_MAX_SIZE', 10485760))  # 10MB
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 5))
    
    # =============================================================================
    # Security Configuration
    # =============================================================================
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5000').split(',')
    RATE_LIMIT_REQUESTS = int(os.getenv('RATE_LIMIT_REQUESTS', 100))
    RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', 3600))  # 1 hour
    
    # =============================================================================
    # Monitoring Configuration
    # =============================================================================
    SENTRY_DSN = os.getenv('SENTRY_DSN')
    NEW_RELIC_LICENSE_KEY = os.getenv('NEW_RELIC_LICENSE_KEY')
    NEW_RELIC_APP_NAME = os.getenv('NEW_RELIC_APP_NAME', 'HabitOS')
    
    # =============================================================================
    # Redis Configuration
    # =============================================================================
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    
    # =============================================================================
    # File Upload Configuration
    # =============================================================================
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16777216))  # 16MB
    ALLOWED_EXTENSIONS = os.getenv('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,pdf').split(',')
    
    # =============================================================================
    # Feature Flags
    # =============================================================================
    ENABLE_AI_FEATURES = os.getenv('ENABLE_AI_FEATURES', 'True').lower() == 'true'
    ENABLE_EMAIL_VERIFICATION = os.getenv('ENABLE_EMAIL_VERIFICATION', 'False').lower() == 'true'
    ENABLE_GOOGLE_OAUTH = os.getenv('ENABLE_GOOGLE_OAUTH', 'False').lower() == 'true'
    ENABLE_RATE_LIMITING = os.getenv('ENABLE_RATE_LIMITING', 'True').lower() == 'true'
    ENABLE_CACHING = os.getenv('ENABLE_CACHING', 'False').lower() == 'true'
    
    @staticmethod
    def init_app(app):
        """Initialize application with configuration"""
        pass

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)
        
        # Development logging
        import logging
        from logging.handlers import RotatingFileHandler
        import os
        
        if not os.path.exists('logs'):
            os.mkdir('logs')
            
        file_handler = RotatingFileHandler(
            'logs/habitos.log', 
            maxBytes=10240000, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('HabitOS startup')

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_ECHO = False
    
    def __init__(self):
        super().__init__()
        # Warn if using default secrets in production
        if self.SECRET_KEY == 'dev-secret-key-change-in-production':
            raise ValueError("Must set SECRET_KEY in production!")
        if self.JWT_SECRET_KEY == 'jwt-secret-change-in-production':
            raise ValueError("Must set JWT_SECRET_KEY in production!")
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)
        
        # Production logging
        import logging
        from logging.handlers import RotatingFileHandler
        import os
        
        if not os.path.exists('logs'):
            os.mkdir('logs')
            
        file_handler = RotatingFileHandler(
            'logs/habitos.log', 
            maxBytes=10240000, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        # Initialize Sentry for error tracking
        if app.config.get('SENTRY_DSN'):
            try:
                import sentry_sdk
                from sentry_sdk.integrations.flask import FlaskIntegration
                sentry_sdk.init(
                    dsn=app.config['SENTRY_DSN'],
                    integrations=[FlaskIntegration()],
                    traces_sample_rate=0.1,
                )
            except ImportError:
                app.logger.warning('Sentry SDK not installed. Skipping Sentry initialization.')
        
        # Initialize New Relic for monitoring
        if app.config.get('NEW_RELIC_LICENSE_KEY'):
            try:
                import newrelic.agent
                newrelic.agent.initialize('newrelic.ini')
            except ImportError:
                app.logger.warning('New Relic agent not installed. Skipping New Relic initialization.')
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('HabitOS startup')

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    ENABLE_AI_FEATURES = False
    ENABLE_EMAIL_VERIFICATION = False
    ENABLE_GOOGLE_OAUTH = False
    ENABLE_RATE_LIMITING = False
    ENABLE_CACHING = False

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
