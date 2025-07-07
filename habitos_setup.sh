#!/bin/bash

# HabitOS Project Setup Script

echo "🚀 Setting up HabitOS project structure..."

# Create main project directory
mkdir -p habitos
cd habitos

# Create backend directory structure
mkdir -p backend/{app,migrations,tests}
mkdir -p backend/app/{models,routes,utils,config}

# Create frontend directory structure
mkdir -p frontend/{src,public}
mkdir -p frontend/src/{components,pages,hooks,utils,context,services}
mkdir -p frontend/src/components/{common,dashboard,habits,auth,journal}
mkdir -p frontend/src/pages/{auth,dashboard,habits,journal,profile}

# Create configuration and documentation directories
mkdir -p docs
mkdir -p config

echo "📁 Directory structure created!"

# Create essential files
touch backend/app/__init__.py
touch backend/app/models/__init__.py
touch backend/app/routes/__init__.py
touch backend/app/utils/__init__.py
touch backend/app/config/__init__.py

# Backend configuration files
cat > backend/Pipfile << 'EOF'
[[source]]
url = "https://pypi.org/simple"
verify_ssl = true
name = "pypi"

[packages]
Flask = "~=2.3.3"
Flask-SQLAlchemy = "~=3.0.5"
Flask-Migrate = "~=4.0.5"
Flask-JWT-Extended = "~=4.5.3"
Flask-CORS = "~=4.3.1"
Flask-Mail = "~=0.9.1"
psycopg2-binary = "~=2.9.7"
SQLAlchemy = "~=2.0.21"
bcrypt = "~=4.0.1"
python-dotenv = "~=1.0.0"
marshmallow = "~=3.20.1"
Flask-Marshmallow = "~=0.15.0"
marshmallow-sqlalchemy = "~=0.29.0"
python-dateutil = "~=2.8.2"
requests = "~=2.31.0"
openai = "~=1.3.3"
google-auth = "~=2.23.3"
google-auth-oauthlib = "~=1.1.0"
google-auth-httplib2 = "~=0.1.1"

[dev-packages]
pytest = "~=7.4.2"
pytest-flask = "~=1.2.0"
flask-testing = "~=0.8.1"

[requires]
python_version = "3.11"
EOF

# Environment template
cat > backend/.env.example << 'EOF'
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/habitos_db

# JWT Secret
JWT_SECRET_KEY=your-super-secret-jwt-key-here

# Flask Configuration
FLASK_ENV=development
FLASK_APP=app
SECRET_KEY=your-flask-secret-key-here

# Email Configuration (for reminders)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# OpenAI API (Optional - Stretch Feature)
OPENAI_API_KEY=your-openai-api-key-here

# Google OAuth (Optional - Stretch Feature)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EOF

# Main Flask app configuration
cat > backend/app/config/config.py << 'EOF'
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://username:password@localhost:5432/habitos_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Email Configuration
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    
    # OpenAI Configuration (Optional)
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    
    # Google OAuth Configuration (Optional)
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
EOF

# Database models
cat > backend/app/models/user.py << 'EOF'
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile information
    full_name = db.Column(db.String(100))
    bio = db.Column(db.Text)
    profile_picture = db.Column(db.String(255))
    
    # Account metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    habits = db.relationship('Habit', backref='user', lazy=True, cascade='all, delete-orphan')
    check_ins = db.relationship('CheckIn', backref='user', lazy=True, cascade='all, delete-orphan')
    journal_entries = db.relationship('JournalEntry', backref='user', lazy=True, cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'bio': self.bio,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }
EOF

cat > backend/app/models/habit.py << 'EOF'
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Habit(db.Model):
    __tablename__ = 'habits'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Habit details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))  # e.g., 'health', 'productivity', 'learning'
    
    # Frequency and goals
    frequency = db.Column(db.String(20), default='daily')  # daily, weekly, monthly
    target_count = db.Column(db.Integer, default=1)  # how many times per frequency period
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    check_ins = db.relationship('CheckIn', backref='habit', lazy=True, cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='habit', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'frequency': self.frequency,
            'target_count': self.target_count,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
EOF

cat > backend/app/models/check_in.py << 'EOF'
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class CheckIn(db.Model):
    __tablename__ = 'check_ins'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    habit_id = db.Column(db.Integer, db.ForeignKey('habits.id'), nullable=False)
    
    # Check-in data
    completed = db.Column(db.Boolean, default=True)
    check_in_date = db.Column(db.Date, default=datetime.utcnow().date)
    mood_rating = db.Column(db.Integer)  # 1-10 scale
    notes = db.Column(db.Text)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    journal_entry = db.relationship('JournalEntry', backref='check_in', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'habit_id': self.habit_id,
            'completed': self.completed,
            'check_in_date': self.check_in_date.isoformat() if self.check_in_date else None,
            'mood_rating': self.mood_rating,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
EOF

cat > backend/app/models/journal_entry.py << 'EOF'
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    check_in_id = db.Column(db.Integer, db.ForeignKey('check_ins.id'), nullable=True)
    
    # Journal content
    content = db.Column(db.Text, nullable=False)
    mood_rating = db.Column(db.Integer)  # 1-10 scale
    
    # AI Analysis (stretch feature)
    sentiment_score = db.Column(db.Float)  # -1 to 1
    sentiment_label = db.Column(db.String(20))  # positive, negative, neutral
    ai_insights = db.Column(db.Text)
    
    # Metadata
    entry_date = db.Column(db.Date, default=datetime.utcnow().date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'check_in_id': self.check_in_id,
            'content': self.content,
            'mood_rating': self.mood_rating,
            'sentiment_score': self.sentiment_score,
            'sentiment_label': self.sentiment_label,
            'ai_insights': self.ai_insights,
            'entry_date': self.entry_date.isoformat() if self.entry_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
EOF

cat > backend/app/models/goal.py << 'EOF'
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Goal(db.Model):
    __tablename__ = 'goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    habit_id = db.Column(db.Integer, db.ForeignKey('habits.id'), nullable=False)
    
    # Goal details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    target_count = db.Column(db.Integer, nullable=False)
    current_count = db.Column(db.Integer, default=0)
    
    # Timeline
    start_date = db.Column(db.Date, default=datetime.utcnow().date)
    target_date = db.Column(db.Date, nullable=False)
    completed_date = db.Column(db.Date)
    
    # Status
    is_completed = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'habit_id': self.habit_id,
            'title': self.title,
            'description': self.description,
            'target_count': self.target_count,
            'current_count': self.current_count,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'is_completed': self.is_completed,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
EOF

# Update models __init__.py
cat > backend/app/models/__init__.py << 'EOF'
from .user import User
from .habit import Habit
from .check_in import CheckIn
from .journal_entry import JournalEntry
from .goal import Goal

__all__ = ['User', 'Habit', 'CheckIn', 'JournalEntry', 'Goal']
EOF

# Main Flask app
cat > backend/app/__init__.py << 'EOF'
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
EOF

# Create run.py
cat > backend/run.py << 'EOF'
import os
from app import create_app

app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
EOF

# Create basic route blueprints
cat > backend/app/routes/auth.py << 'EOF'
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Validate input
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Username, email, and password are required'}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data.get('full_name', '')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'User created successfully',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200
EOF

# Create placeholder route files
for route in users habits check_ins journal goals; do
    cat > "backend/app/routes/${route}.py" << EOF
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db

${route}_bp = Blueprint('${route}', __name__)

@${route}_bp.route('/', methods=['GET'])
@jwt_required()
def get_${route}():
    # TODO: Implement get ${route} functionality
    return jsonify({'message': 'Get ${route} endpoint - TODO'}), 200

@${route}_bp.route('/', methods=['POST'])
@jwt_required()
def create_${route%s}():
    # TODO: Implement create ${route%s} functionality
    return jsonify({'message': 'Create ${route%s} endpoint - TODO'}), 201
EOF
done

# Create Dockerfile
cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "run.py"]
EOF

# Create docker-compose.yml for development
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: habitos_db
      POSTGRES_USER: habitos_user
      POSTGRES_PASSWORD: habitos_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://habitos_user:habitos_pass@db:5432/habitos_db
      FLASK_ENV: development
    volumes:
      - ./backend:/app

volumes:
  postgres_data:
EOF

# Create README
cat > README.md << 'EOF'
# HabitOS

A mindful self-development web app for building consistent habits and tracking emotional well-being.

## Quick Start

1. **Clone and Setup:**
   ```bash
   git clone <your-repo>
   cd habitos
   ```

2. **Start with Docker:**
   ```bash
   docker-compose up
   ```

3. **Or Manual Setup:**
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Setup database
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   
   # Run backend
   python run.py
   ```

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/health` - Health check

## Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp backend/.env.example backend/.env
```

## Database Setup

```bash
cd backend
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Development

- Backend runs on http://localhost:5000
- Database runs on localhost:5432
- API documentation: http://localhost:5000/api/health

## Next Steps

1. Set up frontend React app
2. Implement remaining API endpoints
3. Add authentication middleware
4. Create database migrations
5. Add testing suite
EOF

echo "✅ HabitOS project structure created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. cd habitos"
echo "2. Copy backend/.env.example to backend/.env and update database credentials"
echo "3. Run: docker-compose up (or manual setup as described in README.md)"
echo "4. Initialize database: flask db init && flask db migrate && flask db upgrade"
echo ""
echo "🚀 Your HabitOS backend is ready to go!"
EOF

chmod +x habitos_setup.sh