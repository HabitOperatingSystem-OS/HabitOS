from datetime import datetime, timezone
import uuid
from app import db

class CheckIn(db.Model):
    __tablename__ = 'check_ins'
    
    id = db.Column(db.String(36), primary_key=True, unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    habit_id = db.Column(db.String(36), db.ForeignKey('habits.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Check-in data
    date = db.Column(db.Date, nullable=False)
    completed = db.Column(db.Boolean, default=False)
    actual_value = db.Column(db.Float)  # For numeric habits (e.g., 30 minutes, 5 miles)
    mood_rating = db.Column(db.Integer)  # 1-10 scale
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    journal_entries = db.relationship('JournalEntry', backref='check_in', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert check-in to dictionary"""
        return {
            'id': self.id,
            'habit_id': self.habit_id,
            'user_id': self.user_id,
            'date': self.date.isoformat(),
            'completed': self.completed,
            'actual_value': self.actual_value,
            'mood_rating': self.mood_rating,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<CheckIn {self.habit_id} {self.date} {self.completed}>'