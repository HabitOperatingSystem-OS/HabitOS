from flask import Flask
from app.config.config import config

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    # db.init_app(app)
    # jwt.init_app(app)
    # mail.init_app(app)
    
    return app