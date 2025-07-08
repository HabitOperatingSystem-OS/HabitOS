from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone, timedelta
from enum import Enum
import uuid

db = SQLAlchemy()

class GoalType(Enum):
    STREAK = "streak"  # e.g., "30 day streak"
    TOTAL = "total"    # e.g., "1000 pushups total"
    RATE = "rate"      # e.g., "90% completion rate"
    DURATION = "duration"  # e.g., "Exercise for 30 minutes"

class GoalStatus(Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

class GoalPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Goal(db.Model):
    __tablename__ = 'goals'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    habit_id = db.Column(db.String(36), db.ForeignKey('habits.id'), nullable=False)
    
    # Goal information
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    goal_type = db.Column(db.Enum(GoalType), nullable=False)
    
    # Target and progress
    target_value = db.Column(db.Integer, nullable=False)
    current_value = db.Column(db.Integer, default=0)
    target_unit = db.Column(db.String(50))  # e.g., "days", "minutes", "percent"
    
    # Status and priority
    status = db.Column(db.Enum(GoalStatus), default=GoalStatus.ACTIVE)
    priority = db.Column(db.Enum(GoalPriority), default=GoalPriority.MEDIUM)
    
    # Dates
    start_date = db.Column(db.Date, nullable=False, default=lambda: datetime.now(timezone.utc).date())
    due_date = db.Column(db.Date)
    completed_date = db.Column(db.Date)
    
    # Reminders and notifications
    reminder_enabled = db.Column(db.Boolean, default=True)
    reminder_days_before = db.Column(db.Integer, default=1)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def calculate_progress_percentage(self):
        """Calculate progress percentage towards goal"""
        if self.target_value == 0:
            return 0
        return min(100, (self.current_value / self.target_value) * 100)
    
    def update_progress(self):
        """Update current progress based on habit data"""
        from .check_in import CheckIn
        
        if self.goal_type == GoalType.STREAK:
            # Update based on current habit streak
            self.current_value = self.habit.current_streak
            
        elif self.goal_type == GoalType.TOTAL:
            # Sum up all actual values from check-ins
            total = db.session.query(db.func.sum(CheckIn.actual_value)).filter(
                CheckIn.habit_id == self.habit_id,
                CheckIn.date >= self.start_date,
                CheckIn.completed == True
            ).scalar() or 0
            self.current_value = total
            
        elif self.goal_type == GoalType.RATE:
            # Calculate completion rate
            completion_rate = self.habit.calculate_completion_rate(
                days=(datetime.now(timezone.utc).date() - self.start_date).days
            )
            self.current_value = int(completion_rate)
            
        elif self.goal_type == GoalType.DURATION:
            # Calculate total duration from start date
            if self.due_date:
                total_days = (self.due_date - self.start_date).days
                elapsed_days = (datetime.now(timezone.utc).date() - self.start_date).days
                self.current_value = min(elapsed_days, total_days)
        
        # Check if goal is completed
        if self.current_value >= self.target_value and self.status == GoalStatus.ACTIVE:
            self.status = GoalStatus.COMPLETED
            self.completed_date = datetime.now(timezone.utc).date()
    
    def is_overdue(self):
        """Check if goal is overdue"""
        if not self.due_date:
            return False
        return datetime.now(timezone.utc).date() > self.due_date and self.status == GoalStatus.ACTIVE
    
    def days_until_due(self):
        """Calculate days until due date"""
        if not self.due_date:
            return None
        return (self.due_date - datetime.now(timezone.utc).date()).days
    
    def get_estimated_completion_date(self):
        """Estimate when goal will be completed based on current progress"""
        if self.current_value == 0:
            return None
        
        days_elapsed = (datetime.now(timezone.utc).date() - self.start_date).days
        if days_elapsed == 0:
            return None
        
        daily_progress = self.current_value / days_elapsed
        remaining_progress = self.target_value - self.current_value
        
        if daily_progress <= 0:
            return None
        
        days_to_completion = remaining_progress / daily_progress
        return datetime.now(timezone.utc).date() + timedelta(days=int(days_to_completion))
    
    def is_on_track(self):
        """Check if goal is on track to be completed by due date"""
        if not self.due_date:
            return True
        
        days_remaining = self.days_until_due()
        if days_remaining is None or days_remaining <= 0:
            return False
        
        progress_percentage = self.calculate_progress_percentage()
        days_total = (self.due_date - self.start_date).days
        days_elapsed = days_total - days_remaining
        
        expected_progress = (days_elapsed / days_total) * 100
        return progress_percentage >= expected_progress * 0.8  # 80% of expected progress
    
    def get_milestones(self):
        """Get milestone markers for progress visualization"""
        milestones = []
        
        # Create milestones at 25%, 50%, 75%, and 100%
        for percentage in [25, 50, 75, 100]:
            milestone_value = int((percentage / 100) * self.target_value)
            milestones.append({
                'percentage': percentage,
                'value': milestone_value,
                'achieved': self.current_value >= milestone_value,
                'unit': self.target_unit
            })
        
        return milestones
    
    def to_dict(self, include_analytics=False):
        """Convert goal to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'habit_id': self.habit_id,
            'title': self.title,
            'description': self.description,
            'goal_type': self.goal_type.value,
            'target_value': self.target_value,
            'current_value': self.current_value,
            'target_unit': self.target_unit,
            'status': self.status.value,
            'priority': self.priority.value,
            'start_date': self.start_date.isoformat(),
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'reminder_enabled': self.reminder_enabled,
            'reminder_days_before': self.reminder_days_before,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'progress_percentage': self.calculate_progress_percentage(),
            'is_overdue': self.is_overdue(),
            'days_until_due': self.days_until_due(),
            'habit_title': self.habit.title if self.habit else None
        }
        
        if include_analytics:
            data['analytics'] = {
                'estimated_completion_date': self.get_estimated_completion_date().isoformat() if self.get_estimated_completion_date() else None,
                'is_on_track': self.is_on_track(),
                'milestones': self.get_milestones()
            }
        
        return data
    
    @classmethod
    def get_active_goals_for_user(cls, user_id):
        """Get all active goals for a user"""
        return cls.query.filter(
            cls.user_id == user_id,
            cls.status == GoalStatus.ACTIVE
        ).order_by(cls.due_date.asc()).all()
    
    @classmethod
    def get_overdue_goals_for_user(cls, user_id):
        """Get overdue goals for a user"""
        today = datetime.now(timezone.utc).date()
        return cls.query.filter(
            cls.user_id == user_id,
            cls.status == GoalStatus.ACTIVE,
            cls.due_date < today
        ).all()
    
    def __repr__(self):
        return f'<Goal {self.title}>'