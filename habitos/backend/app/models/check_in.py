from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from enum import Enum
import uuid

db = SQLAlchemy()

class MoodLevel(Enum):
    VERY_LOW = 1
    LOW = 2
    NEUTRAL = 3
    HIGH = 4
    VERY_HIGH = 5

class CheckIn(db.Model):
    __tablename__ = 'check_ins'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    habit_id = db.Column(db.String(36), db.ForeignKey('habits.id'), nullable=False)
    
    # Check-in data
    date = db.Column(db.Date, nullable=False, default=lambda: datetime.now(timezone.utc).date())
    completed = db.Column(db.Boolean, default=False)
    
    # Progress tracking
    actual_value = db.Column(db.Integer)  # e.g., actual minutes exercised
    notes = db.Column(db.Text)
    
    # Mood tracking
    mood_before = db.Column(db.Enum(MoodLevel))
    mood_after = db.Column(db.Enum(MoodLevel))
    
    # Energy and motivation levels (1-5 scale)
    energy_level = db.Column(db.Integer)  # 1-5
    motivation_level = db.Column(db.Integer)  # 1-5
    difficulty_level = db.Column(db.Integer)  # 1-5 (how hard was it?)
    
    # Context
    location = db.Column(db.String(100))
    tags = db.Column(db.JSON)  # Array of tags like ["morning", "gym", "tired"]
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    journal_entry = db.relationship('JournalEntry', backref='check_in', uselist=False, cascade='all, delete-orphan')
    
    # Unique constraint to prevent duplicate check-ins for same habit on same day
    __table_args__ = (db.UniqueConstraint('user_id', 'habit_id', 'date', name='unique_daily_checkin'),)
    
    def calculate_completion_percentage(self):
        """Calculate completion percentage based on target vs actual"""
        if not self.habit.target_value or not self.actual_value:
            return 100 if self.completed else 0
        
        return min(100, (self.actual_value / self.habit.target_value) * 100)
    
    def get_mood_change(self):
        """Get mood change from before to after"""
        if self.mood_before and self.mood_after:
            return self.mood_after.value - self.mood_before.value
        return None
    
    def add_tags(self, tags_list):
        """Add tags to check-in"""
        if not self.tags:
            self.tags = []
        
        for tag in tags_list:
            if tag not in self.tags:
                self.tags.append(tag.lower().strip())
    
    def remove_tags(self, tags_list):
        """Remove tags from check-in"""
        if not self.tags:
            return
        
        for tag in tags_list:
            if tag.lower().strip() in self.tags:
                self.tags.remove(tag.lower().strip())
    
    def validate_levels(self):
        """Validate that level values are within acceptable ranges"""
        errors = []
        
        if self.energy_level is not None and (self.energy_level < 1 or self.energy_level > 5):
            errors.append("Energy level must be between 1 and 5")
        
        if self.motivation_level is not None and (self.motivation_level < 1 or self.motivation_level > 5):
            errors.append("Motivation level must be between 1 and 5")
        
        if self.difficulty_level is not None and (self.difficulty_level < 1 or self.difficulty_level > 5):
            errors.append("Difficulty level must be between 1 and 5")
        
        return errors
    
    def is_overdue(self):
        """Check if this check-in is overdue"""
        today = datetime.now(timezone.utc).date()
        return self.date < today and not self.completed
    
    def get_analytics_data(self):
        """Get data for analytics and insights"""
        return {
            'completion_percentage': self.calculate_completion_percentage(),
            'mood_change': self.get_mood_change(),
            'levels': {
                'energy': self.energy_level,
                'motivation': self.motivation_level,
                'difficulty': self.difficulty_level
            },
            'is_overdue': self.is_overdue(),
            'tags': self.tags or []
        }
    
    def to_dict(self, include_analytics=False):
        """Convert check-in to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'habit_id': self.habit_id,
            'date': self.date.isoformat(),
            'completed': self.completed,
            'actual_value': self.actual_value,
            'notes': self.notes,
            'mood_before': self.mood_before.value if self.mood_before else None,
            'mood_after': self.mood_after.value if self.mood_after else None,
            'energy_level': self.energy_level,
            'motivation_level': self.motivation_level,
            'difficulty_level': self.difficulty_level,
            'location': self.location,
            'tags': self.tags or [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'habit_title': self.habit.title if self.habit else None
        }
        
        if include_analytics:
            data['analytics'] = self.get_analytics_data()
        
        if self.journal_entry:
            data['journal_entry'] = self.journal_entry.to_dict()
            
        return data
    
    @classmethod
    def get_user_check_ins_for_date(cls, user_id, date):
        """Get all check-ins for a user on a specific date"""
        return cls.query.filter(
            cls.user_id == user_id,
            cls.date == date
        ).all()
    
    @classmethod
    def get_habit_streak_data(cls, habit_id, limit=30):
        """Get streak data for a specific habit"""
        return cls.query.filter(
            cls.habit_id == habit_id,
            cls.completed == True
        ).order_by(cls.date.desc()).limit(limit).all()
    
    def __repr__(self):
        return f'<CheckIn {self.habit.title if self.habit else "Unknown"} - {self.date}>'