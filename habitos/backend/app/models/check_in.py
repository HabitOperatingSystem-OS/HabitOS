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
