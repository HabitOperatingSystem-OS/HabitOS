from datetime import datetime, timezone
import uuid
from app import db

class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    
    id = db.Column(db.String(36), primary_key=True, unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    checkin_id = db.Column(db.String(36), db.ForeignKey('check_ins.id'), nullable=False)
    
    # Journal content
    content = db.Column(db.Text, nullable=False)
    entry_date = db.Column(db.Date, nullable=False, default=lambda: datetime.now(timezone.utc).date())
    
    # AI analysis results
    ai_insights = db.Column(db.Text)  # AI-generated insights
    ai_summary = db.Column(db.Text)  # AI-generated summary
    insights_generated_at = db.Column(db.DateTime)  # When insights were generated
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def _get_user_context(self):
        """Get user context for personalized AI insights"""
        try:
            from app.models.habit import Habit
            from app.models.goal import Goal
            from app.models.check_in import CheckIn
            
            # Get user's habits
            habits = Habit.query.filter_by(user_id=self.user_id).all()
            habit_titles = [habit.title for habit in habits]
            
            # Get user's active goals
            goals = Goal.query.filter_by(user_id=self.user_id, status='in_progress').all()
            goal_titles = [goal.title for goal in goals]
            
            # Get recent mood trends from check-ins
            recent_checkins = CheckIn.query.filter_by(user_id=self.user_id)\
                .order_by(CheckIn.date.desc())\
                .limit(7)\
                .all()
            mood_trends = [checkin.mood_rating for checkin in recent_checkins if checkin.mood_rating]
            
            return {
                'habits': habit_titles,
                'goals': goal_titles,
                'mood_trends': mood_trends
            }
            
        except Exception as e:
            return {}
    
    def to_dict(self, include_ai_data=False):
        """Convert journal entry to dictionary"""
        entry_dict = {
            'id': self.id,
            'user_id': self.user_id,
            'checkin_id': self.checkin_id,
            'content': self.content,
            'entry_date': self.entry_date.isoformat() if self.entry_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Include mood rating from associated check-in if available
        try:
            from app.models.check_in import CheckIn
            check_in = CheckIn.query.get(self.checkin_id)
            if check_in and check_in.mood_rating is not None:
                entry_dict['mood_rating'] = check_in.mood_rating
        except Exception:
            pass
        
        # Include AI data if requested
        if include_ai_data:
            entry_dict.update({
                'ai_insights': self.ai_insights,
                'ai_summary': self.ai_summary,
                'insights_generated_at': self.insights_generated_at.isoformat() if self.insights_generated_at else None
            })
        
        return entry_dict
    
    def __repr__(self):
        return f'<JournalEntry {self.id}: {self.content[:50]}...>'
