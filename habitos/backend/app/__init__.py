from flask import Flask, request, g
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
import uuid
import time

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
mail = Mail()

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Load configuration
    from app.config.config import config
    app.config.from_object(config[config_name])
    
    # Initialize configuration
    config[config_name].init_app(app)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)
    mail.init_app(app)
    
    # Setup logging
    from app.utils.logger import setup_logging
    setup_logging(app)
    
    # Setup security middleware
    from app.utils.security import SecurityMiddleware
    security_middleware = SecurityMiddleware(app)
    
    # Setup monitoring
    from app.utils.monitoring import MetricsCollector
    metrics_collector = MetricsCollector(app)
    
    # Import models to ensure they're registered
    from app.models import User, Habit, CheckIn, JournalEntry, Goal
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.habits import habits_bp
    from app.routes.check_ins import check_ins_bp
    from app.routes.journal import journal_bp
    from app.routes.goals import goals_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(habits_bp, url_prefix='/api/habits')
    app.register_blueprint(check_ins_bp, url_prefix='/api/checkins')
    app.register_blueprint(journal_bp, url_prefix='/api/journal')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    
    # Register health check blueprint
    from app.utils.monitoring import create_health_check_blueprint
    health_bp = create_health_check_blueprint()
    app.register_blueprint(health_bp, url_prefix='/api')
    
    # Request processing middleware
    @app.before_request
    def before_request():
        # Generate request ID for tracking
        g.request_id = str(uuid.uuid4())
        g.start_time = time.time()
        
        # Log request information
        from app.utils.logger import log_request_info
        log_request_info()
        
        # Store metrics collector in app context
        g.metrics_collector = metrics_collector
    
    @app.after_request
    def after_request(response):
        # Record metrics
        if hasattr(g, 'metrics_collector') and hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            g.metrics_collector.record_request_metric(
                request.endpoint or 'unknown',
                request.method,
                response.status_code,
                duration
            )
        
        # Add request ID to response headers
        if hasattr(g, 'request_id'):
            response.headers['X-Request-ID'] = g.request_id
        
        return response
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found', 'message': 'The requested resource was not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        # Log the error
        from app.utils.logger import log_error
        log_error(error, {'request_id': getattr(g, 'request_id', 'unknown')})
        
        return {'error': 'Internal server error', 'message': 'An unexpected error occurred'}, 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        # Log the error
        from app.utils.logger import log_error
        log_error(error, {'request_id': getattr(g, 'request_id', 'unknown')})
        
        return {'error': 'Internal server error', 'message': 'An unexpected error occurred'}, 500
    
    return app
