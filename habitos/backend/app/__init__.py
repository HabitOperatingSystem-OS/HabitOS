"""
HabitOS Flask Application Factory
"""

import os
import logging
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name=None):
    """
    Application factory pattern for creating Flask app instances
    
    Args:
        config_name (str): Configuration name (development, testing, production)
    
    Returns:
        Flask: Configured Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    if config_name == 'production':
        app.config.from_object('app.config.config.ProductionConfig')
    elif config_name == 'testing':
        app.config.from_object('app.config.config.TestingConfig')
    else:
        app.config.from_object('app.config.config.DevelopmentConfig')
    
    # Initialize logging
    setup_logging(app)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has expired',
            'message': 'The token has expired. Please log in again.'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid token',
            'message': 'The token is invalid. Please log in again.'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Authorization required',
            'message': 'Request does not contain an access token.'
        }), 401
    
    # Setup CORS with proper preflight handling
    CORS(app, 
         origins=app.config.get('CORS_ORIGINS', ['http://localhost:3000']),
         supports_credentials=True,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'])
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.habits import habits_bp
    from app.routes.check_ins import check_ins_bp
    from app.routes.goals import goals_bp
    from app.routes.journal import journal_bp
    from app.routes.users import users_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.simple_ai import simple_ai_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(habits_bp, url_prefix='/api/habits')
    app.register_blueprint(check_ins_bp, url_prefix='/api/check-ins')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    app.register_blueprint(journal_bp, url_prefix='/api/journal')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(simple_ai_bp, url_prefix='/api/ai')
    
    # Initialize security middleware (only in production or when explicitly enabled)
    if app.config.get('ENABLE_SECURITY_MIDDLEWARE', False):
        try:
            from app.utils.security import SecurityMiddleware
            with app.app_context():
                security_middleware = SecurityMiddleware(app)
                app.logger.info("Security middleware initialized successfully")
        except Exception as e:
            app.logger.warning(f"Security middleware initialization failed: {e}")
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        """Health check endpoint for monitoring"""
        return {
            'status': 'healthy',
            'service': 'HabitOS API',
            'version': '1.0.0'
        }
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found', 'message': 'The requested resource was not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {error}")
        return {'error': 'Internal server error', 'message': 'An unexpected error occurred'}, 500
    
    app.logger.info(f"HabitOS application initialized in {config_name} mode")
    
    return app

def setup_logging(app):
    """Setup application logging"""
    if not app.debug:
        # Production logging
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        file_handler = logging.FileHandler('logs/habitos.log')
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('HabitOS startup')
    else:
        # Development logging
        app.logger.setLevel(logging.DEBUG)
        app.logger.info('HabitOS startup')
