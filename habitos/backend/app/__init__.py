from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail

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
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)
    mail.init_app(app)
    
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
    app.register_blueprint(check_ins_bp, url_prefix='/api/check-ins')
    app.register_blueprint(journal_bp, url_prefix='/api/journal')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'service': 'HabitOS API'}
    
    return app
