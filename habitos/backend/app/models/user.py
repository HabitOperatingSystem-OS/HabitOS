from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
import uuid

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile information
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    timezone = db.Column(db.String(50), default='UTC')
    
    # Account status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)
    
    # Relationships
    habits = db.relationship('Habit', backref='user', lazy=True, cascade='all, delete-orphan')
    check_ins = db.relationship('CheckIn', backref='user', lazy=True, cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='user', lazy=True, cascade='all, delete-orphan')
    journal_entries = db.relationship('JournalEntry', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def get_full_name(self):
        """Get user's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.now(timezone.utc)
        db.session.commit()
    
    def to_dict(self, include_sensitive=False):
        """Convert user to dictionary"""
        data = {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'timezone': self.timezone,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'full_name': self.get_full_name()
        }
        
        if include_sensitive:
            data['password_hash'] = self.password_hash
            
        return data
    
    def __repr__(self):
        return f'<User {self.username}>'