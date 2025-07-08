from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone, timedelta
from enum import Enum
import uuid

db = SQLAlchemy()

class HabitCategory(Enum):
    HEALTH = "health"
    FITNESS = "fitness"
    PRODUCTIVITY = "productivity"
    MINDFULNESS = "mindfulness"
    LEARNING = "learning"
    SOCIAL = "social"
    CREATIVE = "creative"
    PERSONAL = "personal"
    OTHER = "other"

class HabitFrequency(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

class HabitStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class Habit(db.Model):
    __tablename__ = 'habits'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Core habit information
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.Enum(HabitCategory), nullable=False, default=HabitCategory.PERSONAL)
    
    # Frequency and goal settings
    frequency = db.Column(db.Enum(HabitFrequency), nullable=False, default=HabitFrequency.DAILY)
    frequency_count = db.Column(db.Integer, default=1)  # e.g., 3 times per week
    target_value = db.Column(db.Integer, default=1)  # e.g., 30 minutes, 10 pushups
    target_unit = db.Column(db.String(50))  # e.g., "minutes", "reps", "pages"
    
    # Status and tracking
    status = db.Column(db.Enum(HabitStatus), nullable=False, default=HabitStatus.ACTIVE)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    
    # Dates
    start_date = db.Column(db.Date, nullable=False, default=lambda: datetime.now(timezone.utc).date())
    end_date = db.Column(db.Date)  # Optional end date for time-bound habits
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    check_ins = db.relationship('CheckIn', backref='habit', lazy=True, cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='habit', lazy=True, cascade='all, delete-orphan')
    
    def calculate_completion_rate(self, days=30):
        """Calculate completion rate over the last N days"""
        from .check_in import CheckIn
        
        end_date = datetime.now(timezone.utc).date()
        start_date = end_date - timedelta(days=days)
        
        total_expected = 0
        completed = 0
        
        # Get check-ins for the period
        check_ins = CheckIn.query.filter(
            CheckIn.habit_id == self.id,
            CheckIn.date >= start_date,
            CheckIn.date <= end_date
        ).all()
        
        # Calculate expected completions based on frequency
        current_date = start_date
        while current_date <= end_date:
            if current_date >= self.start_date:
                if self.frequency == HabitFrequency.DAILY:
                    total_expected += 1
                elif self.frequency == HabitFrequency.WEEKLY:
                    if current_date.weekday() == 0:  # Monday
                        total_expected += self.frequency_count
                # Add more frequency logic as needed
            current_date += timedelta(days=1)
        
        # Count completed check-ins
        completed = len([ci for ci in check_ins if ci.completed])
        
        return (completed / total_expected * 100) if total_expected > 0 else 0
    
    def update_streak(self):
        """Update current streak based on recent check-ins"""
        from .check_in import CheckIn
        
        # Get recent check-ins ordered by date desc
        recent_check_ins = CheckIn.query.filter(
            CheckIn.habit_id == self.id,
            CheckIn.completed == True
        ).order_by(CheckIn.date.desc()).limit(30).all()
        
        if not recent_check_ins:
            self.current_streak = 0
            return
        
        # Calculate current streak
        current_streak = 0
        today = datetime.now(timezone.utc).date()
        
        for check_in in recent_check_ins:
            expected_date = today - timedelta(days=current_streak)
            if check_in.date == expected_date:
                current_streak += 1
            else:
                break
        
        self.current_streak = current_streak
        
        # Update longest streak if current is higher
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
    
    def is_due_today(self):
        """Check if habit is due today based on frequency"""
        today = datetime.now(timezone.utc).date()
        
        if self.status != HabitStatus.ACTIVE:
            return False
        
        if self.end_date and today > self.end_date:
            return False
        
        if today < self.start_date:
            return False
        
        if self.frequency == HabitFrequency.DAILY:
            return True
        elif self.frequency == HabitFrequency.WEEKLY:
            # Check if it's the right day of the week
            return today.weekday() == 0  # Monday for now, make configurable
        elif self.frequency == HabitFrequency.MONTHLY:
            return today.day == 1  # First day of month for now, make configurable
        
        return False
    
    def get_progress_data(self, days=30):
        """Get progress data for charts/analytics"""
        from .check_in import CheckIn
        
        end_date = datetime.now(timezone.utc).date()
        start_date = end_date - timedelta(days=days)
        
        check_ins = CheckIn.query.filter(
            CheckIn.habit_id == self.id,
            CheckIn.date >= start_date,
            CheckIn.date <= end_date
        ).order_by(CheckIn.date).all()
        
        return {
            'completion_rate': self.calculate_completion_rate(days),
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'check_ins': [ci.to_dict() for ci in check_ins]
        }
    
    def to_dict(self, include_progress=False):
        """Convert habit to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'category': self.category.value,
            'frequency': self.frequency.value,
            'frequency_count': self.frequency_count,
            'target_value': self.target_value,
            'target_unit': self.target_unit,
            'status': self.status.value,
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_due_today': self.is_due_today()
        }
        
        if include_progress:
            data['progress'] = self.get_progress_data()
            
        return data
    
    def __repr__(self):
        return f'<Habit {self.title}>'
