from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from enum import Enum
import uuid

db = SQLAlchemy()

class SentimentType(Enum):
    VERY_NEGATIVE = "very_negative"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    POSITIVE = "positive"
    VERY_POSITIVE = "very_positive"

class JournalEntryType(Enum):
    DAILY = "daily"
    HABIT_REFLECTION = "habit_reflection"
    GOAL_REFLECTION = "goal_reflection"
    MILESTONE = "milestone"
    CHALLENGE = "challenge"
    GRATITUDE = "gratitude"
    FREE_FORM = "free_form"

class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    check_in_id = db.Column(db.String(36), db.ForeignKey('check_ins.id'), nullable=True)
    
    # Journal content
    title = db.Column(db.String(255))
    content = db.Column(db.Text, nullable=False)
    entry_type = db.Column(db.Enum(JournalEntryType), default=JournalEntryType.FREE_FORM)
    
    # Mood and sentiment
    mood_rating = db.Column(db.Integer)  # 1-10 scale
    sentiment = db.Column(db.Enum(SentimentType))
    sentiment_score = db.Column(db.Float)  # AI-generated sentiment score (-1 to 1)
    
    # Metadata
    word_count = db.Column(db.Integer)
    reading_time_minutes = db.Column(db.Integer)
    
    # AI analysis (optional)
    ai_insights = db.Column(db.JSON)  # Store AI-generated insights
    ai_tags = db.Column(db.JSON)  # Array of AI-generated tags
    ai_summary = db.Column(db.Text)  # AI-generated summary
    
    # Privacy and sharing
    is_private = db.Column(db.Boolean, default=True)
    is_favorite = db.Column(db.Boolean, default=False)
    
    # Timestamps
    entry_date = db.Column(db.Date, default=lambda: datetime.now(timezone.utc).date())
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def calculate_word_count(self):
        """Calculate and update word count"""
        if self.content:
            self.word_count = len(self.content.split())
            # Estimate reading time (average 200 words per minute)
            self.reading_time_minutes = max(1, round(self.word_count / 200))
        else:
            self.word_count = 0
            self.reading_time_minutes = 0
    
    def analyze_sentiment(self):
        """Analyze sentiment from content (placeholder for AI integration)"""
        if not self.content:
            return
        
        # Placeholder for AI sentiment analysis
        # In real implementation, this would call OpenAI or similar service
        content_lower = self.content.lower()
        
        # Simple keyword-based sentiment analysis (replace with AI)
        positive_words = ['good', 'great', 'amazing', 'happy', 'excited', 'accomplished', 'proud', 'motivated']
        negative_words = ['bad', 'terrible', 'frustrated', 'tired', 'difficult', 'challenging', 'struggled', 'disappointed']
        
        positive_count = sum(1 for word in positive_words if word in content_lower)
        negative_count = sum(1 for word in negative_words if word in content_lower)
        
        if positive_count > negative_count:
            self.sentiment = SentimentType.POSITIVE
            self.sentiment_score = 0.3  # Placeholder score
        elif negative_count > positive_count:
            self.sentiment = SentimentType.NEGATIVE
            self.sentiment_score = -0.3  # Placeholder score
        else:
            self.sentiment = SentimentType.NEUTRAL
            self.sentiment_score = 0.0
    
    def generate_ai_insights(self):
        """Generate AI insights from journal entry (placeholder)"""
        if not self.content:
            return
        
        # Placeholder for AI insights generation
        # In real implementation, this would call OpenAI API
        insights = {
            'themes': ['self-reflection', 'habit-building'],
            'emotions': ['determination', 'optimism'],
            'suggestions': ['Consider setting smaller, achievable goals'],
            'patterns': ['Shows consistent self-awareness'],
            'confidence_score': 0.8
        }
        
        self.ai_insights = insights
        
        # Generate tags based on content
        tags = []
        content_lower = self.content.lower()
        
        if 'exercise' in content_lower or 'workout' in content_lower:
            tags.append('fitness')
        if 'meditation' in content_lower or 'mindful' in content_lower:
            tags.append('mindfulness')
        if 'goal' in content_lower or 'target' in content_lower:
            tags.append('goal-setting')
        if 'challenge' in content_lower or 'difficult' in content_lower:
            tags.append('challenges')
        
        self.ai_tags = tags
        
        # Generate summary (first 100 characters as placeholder)
        self.ai_summary = self.content[:100] + "..." if len(self.content) > 100 else self.content
    
    def get_related_entries(self, limit=5):
        """Get related journal entries based on tags and sentiment"""
        if not self.ai_tags:
            return []
        
        related = JournalEntry.query.filter(
            JournalEntry.user_id == self.user_id,
            JournalEntry.id != self.id,
            JournalEntry.ai_tags.op('&&')(self.ai_tags)  # PostgreSQL array overlap
        ).limit(limit).all()
        
        return related
    
    def get_mood_trend(self, days=30):
        """Get mood trend over time"""
        from datetime import timedelta
        
        start_date = self.entry_date - timedelta(days=days)
        
        entries = JournalEntry.query.filter(
            JournalEntry.user_id == self.user_id,
            JournalEntry.entry_date >= start_date,
            JournalEntry.entry_date <= self.entry_date,
            JournalEntry.mood_rating.isnot(None)
        ).order_by(JournalEntry.entry_date).all()
        
        return [{
            'date': entry.entry_date.isoformat(),
            'mood_rating': entry.mood_rating,
            'sentiment': entry.sentiment.value if entry.sentiment else None
        } for entry in entries]
    
    def validate_mood_rating(self):
        """Validate mood rating is within acceptable range"""
        if self.mood_rating is not None and (self.mood_rating < 1 or self.mood_rating > 10):
            return False, "Mood rating must be between 1 and 10"
        return True, None
    
    def to_dict(self, include_ai_data=False, include_content=True):
        """Convert journal entry to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'check_in_id': self.check_in_id,
            'title': self.title,
            'entry_type': self.entry_type.value,
            'mood_rating': self.mood_rating,
            'sentiment': self.sentiment.value if self.sentiment else None,
            'sentiment_score': self.sentiment_score,
            'word_count': self.word_count,
            'reading_time_minutes': self.reading_time_minutes,
            'is_private': self.is_private,
            'is_favorite': self.is_favorite,
            'entry_date': self.entry_date.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_content:
            data['content'] = self.content
        
        if include_ai_data:
            data['ai_insights'] = self.ai_insights
            data['ai_tags'] = self.ai_tags or []
            data['ai_summary'] = self.ai_summary
        
        return data
    
    @classmethod
    def get_user_entries_by_date_range(cls, user_id, start_date, end_date):
        """Get journal entries for a user within a date range"""
        return cls.query.filter(
            cls.user_id == user_id,
            cls.entry_date >= start_date,
            cls.entry_date <= end_date
        ).order_by(cls.entry_date.desc()).all()
    
    @classmethod
    def get_user_mood_analytics(cls, user_id, days=30):
        """Get mood analytics for a user"""
        from datetime import timedelta
        
        end_date = datetime.now(timezone.utc).date()
        start_date = end_date - timedelta(days=days)
        
        entries = cls.query.filter(
            cls.user_id == user_id,
            cls.entry_date >= start_date,
            cls.entry_date <= end_date,
            cls.mood_rating.isnot(None)
        ).all()
        
        if not entries:
            return None
        
        mood_ratings = [entry.mood_rating for entry in entries]
        sentiment_scores = [entry.sentiment_score for entry in entries if entry.sentiment_score is not None]
        
        return {
            'average_mood': sum(mood_ratings) / len(mood_ratings),
            'mood_trend': [entry.mood_rating for entry in entries[-7:]],  # Last 7 days
            'average_sentiment': sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0,
            'total_entries': len(entries),
            'total_words': sum(entry.word_count or 0 for entry in entries)
        }
    
    @classmethod
    def get_popular_tags(cls, user_id, limit=10):
        """Get most popular AI tags for a user"""
        # This would need to be implemented with proper JSON aggregation
        # For now, return a placeholder
        return ['motivation', 'progress', 'challenges', 'goals', 'reflection']
    
    def __repr__(self):
        return f'<JournalEntry {self.title or "Untitled"} - {self.entry_date}>'
