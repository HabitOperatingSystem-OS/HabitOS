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
    # Handle Render's database URL format
    database_url = os.getenv('DATABASE_URL')
    if database_url and database_url.startswith('postgres://'):
        # Render uses postgres:// but SQLAlchemy expects postgresql://
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = database_url or 'postgresql://azim:123@localhost:5432/habitos'
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
    # AI Configuration
    # =============================================================================
    # OpenAI Configuration (Legacy)
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    
    # Google Gemini Configuration
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
    GEMINI_MAX_TOKENS = int(os.getenv('GEMINI_MAX_TOKENS', 2048))
    GEMINI_TEMPERATURE = float(os.getenv('GEMINI_TEMPERATURE', 0.7))
    
    # =============================================================================
    # Google OAuth Configuration
    # =============================================================================
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    
    # =============================================================================
    # Logging Configuration
    # =============================================================================
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # =============================================================================
    # Security Configuration
    # =============================================================================
    # More explicit CORS configuration with better fallbacks
    cors_origins_env = os.getenv('CORS_ORIGINS', '')
    if cors_origins_env:
        CORS_ORIGINS = [origin.strip() for origin in cors_origins_env.split(',') if origin.strip()]
    else:
        # Fallback for development
        CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5173']
    
    # Add production frontend URL if not already included
    if os.getenv('FLASK_ENV') == 'production':
        production_frontend = 'https://habitos-frontend.onrender.com'
        if production_frontend not in CORS_ORIGINS:
            CORS_ORIGINS.append(production_frontend)
    
    # =============================================================================
    # Feature Flags
    # =============================================================================
    ENABLE_AI_INSIGHTS = os.getenv('ENABLE_AI_INSIGHTS', 'true').lower() == 'true'
    ENABLE_JOURNAL_PROMPTS = os.getenv('ENABLE_JOURNAL_PROMPTS', 'true').lower() == 'true'
    ENABLE_SENTIMENT_ANALYSIS = os.getenv('ENABLE_SENTIMENT_ANALYSIS', 'true').lower() == 'true'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True
    LOG_LEVEL = 'DEBUG'
    
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
    LOG_LEVEL = 'WARNING'
    
    # Production security settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': int(os.getenv('DATABASE_POOL_SIZE', 20)),
        'max_overflow': int(os.getenv('DATABASE_MAX_OVERFLOW', 40)),
        'pool_timeout': int(os.getenv('DATABASE_POOL_TIMEOUT', 30)),
        'pool_recycle': int(os.getenv('DATABASE_POOL_RECYCLE', 3600)),
    }
    
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
    LOG_LEVEL = 'ERROR'
    
    # Disable AI features for testing
    ENABLE_AI_INSIGHTS = False
    ENABLE_JOURNAL_PROMPTS = False
    ENABLE_SENTIMENT_ANALYSIS = False
    
    # Override engine options for SQLite testing
    SQLALCHEMY_ENGINE_OPTIONS = {}

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
