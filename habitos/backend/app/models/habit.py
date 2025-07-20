from datetime import datetime, timezone, timedelta
from enum import Enum
import uuid
from app import db

class HabitCategory(Enum):
    PERSONAL = "personal"
    HEALTH = "health"
    FITNESS = "fitness"
    PRODUCTIVITY = "productivity"
    MINDFULNESS = "mindfulness"
    LEARNING = "learning"
    SOCIAL = "social"
    CREATIVE = "creative"
    OTHER = "other"

class HabitFrequency(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

class Habit(db.Model):
    __tablename__ = 'habits'
    
    id = db.Column(db.String(36), primary_key=True, unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Core habit information
    title = db.Column(db.String(255), nullable=False)
    category = db.Column(db.Enum(HabitCategory), nullable=False, default=HabitCategory.PERSONAL)
    
    # Frequency and goal settings
    frequency = db.Column(db.Enum(HabitFrequency), nullable=False, default=HabitFrequency.DAILY)
    frequency_count = db.Column(db.Integer, default=0)
    
    # Status and tracking
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    active = db.Column(db.Boolean, default=True)
    
    # Dates
    start_date = db.Column(db.Date, nullable=False, default=lambda: datetime.now(timezone.utc).date())
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
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
                    # Count weeks in the period
                    if current_date.weekday() == 0:  # Start of week (Monday)
                        total_expected += max(self.frequency_count, 1)  # At least 1 expected per week
                elif self.frequency == HabitFrequency.MONTHLY:
                    # Count months in the period
                    if current_date.day == 1:  # Start of month
                        total_expected += max(self.frequency_count, 1)  # At least 1 expected per month
                elif self.frequency == HabitFrequency.CUSTOM:
                    # For custom frequency, treat as daily with custom count
                    total_expected += max(self.frequency_count, 1)  # At least 1 expected per day
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
        """
        Check if habit is due today based on frequency.
        
        For weekly/monthly habits, this checks if the user hasn't completed
        the required number of check-ins for the current period yet.
        This allows users to complete their habits on any day within the period,
        not just on specific days like Monday or the 1st of the month.
        """
        today = datetime.now(timezone.utc).date()
        
        if today < self.start_date:
            return False
        
        if self.frequency == HabitFrequency.DAILY:
            return True
        elif self.frequency == HabitFrequency.WEEKLY:
            # Check if we haven't completed this habit this week yet
            from .check_in import CheckIn
            
            # Get the start of the current week (Monday)
            start_of_week = today - timedelta(days=today.weekday())
            
            # Check if there's already a completed check-in this week
            this_week_check_ins = CheckIn.query.filter(
                CheckIn.habit_id == self.id,
                CheckIn.date >= start_of_week,
                CheckIn.date <= today,
                CheckIn.completed == True
            ).count()
            
            # Allow if we haven't completed the required number of times this week
            required_count = max(self.frequency_count, 1)  # At least 1 per week
            return this_week_check_ins < required_count
            
        elif self.frequency == HabitFrequency.MONTHLY:
            # Check if we haven't completed this habit this month yet
            from .check_in import CheckIn
            
            # Get the start of the current month
            start_of_month = today.replace(day=1)
            
            # Check if there's already a completed check-in this month
            this_month_check_ins = CheckIn.query.filter(
                CheckIn.habit_id == self.id,
                CheckIn.date >= start_of_month,
                CheckIn.date <= today,
                CheckIn.completed == True
            ).count()
            
            # Allow if we haven't completed the required number of times this month
            # Users can complete monthly habits on any day of the month
            required_count = max(self.frequency_count, 1)  # At least 1 per month
            return this_month_check_ins < required_count
            
        elif self.frequency == HabitFrequency.CUSTOM:
            # For custom frequency, treat it as daily but with custom count
            from .check_in import CheckIn
            
            # Check if we haven't completed the required number of times today
            today_check_ins = CheckIn.query.filter(
                CheckIn.habit_id == self.id,
                CheckIn.date == today,
                CheckIn.completed == True
            ).count()
            
            required_count = max(self.frequency_count, 1)  # At least 1 per day
            return today_check_ins < required_count
        
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
            'category': self.category.value,
            'frequency': self.frequency.value,
            'frequency_count': self.frequency_count,
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'active': self.active,
            'start_date': self.start_date.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_due_today': self.is_due_today()
        }
        
        if include_progress:
            data['progress'] = self.get_progress_data()
            
        return data
    
    def __repr__(self):
        return f'<Habit {self.title}>'
