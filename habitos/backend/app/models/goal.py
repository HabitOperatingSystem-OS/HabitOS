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
