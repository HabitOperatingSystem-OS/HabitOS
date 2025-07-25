from datetime import datetime, timezone, date
from enum import Enum
import uuid
from app import db

class GoalType(Enum):
    COUNT = "count"
    DURATION = "duration"
    DISTANCE = "distance"
    WEIGHT = "weight"
    CUSTOM = "custom"

class GoalStatus(Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"
    PAUSED = "paused"
    CANCELLED = "cancelled"

class Goal(db.Model):
    __tablename__ = 'goals'
    
    id = db.Column(db.String(36), primary_key=True, unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    habit_id = db.Column(db.String(36), db.ForeignKey('habits.id'), nullable=False)
    
    # Enforce one-to-one relationship between habit and goal
    __table_args__ = (db.UniqueConstraint('habit_id', 'user_id', name='unique_habit_goal'),)
    
    # Goal information
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    goal_type = db.Column(db.Enum(GoalType, values_callable=lambda obj: [e.value for e in obj]), nullable=False)
    target_value = db.Column(db.Float, nullable=False)
    target_unit = db.Column(db.String(50))  # e.g., "times", "minutes", "miles"
    current_value = db.Column(db.Float, default=0)
    
    # Goal settings
    status = db.Column(db.Enum(GoalStatus, values_callable=lambda obj: [e.value for e in obj]), default=GoalStatus.IN_PROGRESS.value)
    start_date = db.Column(db.Date, nullable=False, default=lambda: datetime.now(timezone.utc).date())
    due_date = db.Column(db.Date)
    completed_date = db.Column(db.Date)
    
    # Reminder settings
    reminder_enabled = db.Column(db.Boolean, default=True)
    reminder_days_before = db.Column(db.Integer, default=1)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def is_overdue(self):
        """Check if goal is overdue"""
        if not self.due_date or self.status != GoalStatus.IN_PROGRESS.value:
            return False
        return date.today() > self.due_date
    
    def progress_percentage(self):
        """Calculate progress percentage"""
        if self.target_value <= 0:
            return 0
        return min((self.current_value / self.target_value) * 100, 100)
    
    def is_completed(self):
        """Check if goal is completed"""
        return self.current_value >= self.target_value
    
    @classmethod
    def get_active_goals_for_user(cls, user_id):
        """Get all active goals for a user"""
        return cls.query.filter_by(user_id=user_id, status=GoalStatus.IN_PROGRESS.value).all()
    
    @classmethod
    def get_overdue_goals_for_user(cls, user_id):
        """Get all overdue goals for a user"""
        today = date.today()
        return cls.query.filter(
            cls.user_id == user_id,
            cls.status == GoalStatus.IN_PROGRESS.value,
            cls.due_date < today
        ).all()
    
    def update_progress_from_checkins(self):
        """Update goal progress based on completed check-ins"""
        from app.models.check_in import CheckIn
        
        # Count completed check-ins for this habit since goal start date
        completed_checkins = CheckIn.query.filter(
            CheckIn.habit_id == self.habit_id,
            CheckIn.user_id == self.user_id,
            CheckIn.completed == True,
            CheckIn.date >= self.start_date
        ).count()
        
        # Update current value
        self.current_value = completed_checkins
        
        # Check if goal is completed
        if self.current_value >= self.target_value and self.status == GoalStatus.IN_PROGRESS.value:
            self.status = GoalStatus.COMPLETED
            self.completed_date = date.today()
        
        # Update the updated_at timestamp
        self.updated_at = datetime.now(timezone.utc)
    
    def to_dict(self):
        """Convert goal to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'habit_id': self.habit_id,
            'title': self.title,
            'description': self.description,
            'goal_type': self.goal_type.value,
            'target_value': self.target_value,
            'target_unit': self.target_unit,
            'current_value': self.current_value,
            'status': self.status.value,
            'start_date': self.start_date.isoformat(),
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'reminder_enabled': self.reminder_enabled,
            'reminder_days_before': self.reminder_days_before,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_overdue': self.is_overdue(),
            'progress_percentage': self.progress_percentage(),
            'is_completed': self.is_completed()
        }
    
    def __repr__(self):
        return f'<Goal {self.title}>'