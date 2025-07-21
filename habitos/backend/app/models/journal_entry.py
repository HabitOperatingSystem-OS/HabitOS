from datetime import datetime, timezone
from enum import Enum
import uuid
from app import db

class SentimentType(Enum):
    VERY_NEGATIVE = "very_negative"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    POSITIVE = "positive"
    VERY_POSITIVE = "very_positive"

class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    
    id = db.Column(db.String(36), primary_key=True, unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    checkin_id = db.Column(db.String(36), db.ForeignKey('check_ins.id'), nullable=False)
    
    # Journal content
    content = db.Column(db.Text, nullable=False)
    entry_date = db.Column(db.Date, nullable=False, default=lambda: datetime.now(timezone.utc).date())
    
    # AI analysis results
    sentiment = db.Column(db.Enum(SentimentType))
    sentiment_score = db.Column(db.Float)  # -1 to 1 scale
    ai_insights = db.Column(db.Text)  # AI-generated insights
    ai_summary = db.Column(db.Text)  # AI-generated summary
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def analyze_sentiment(self):
        """Analyze sentiment of the journal content using AI"""
        # This is a placeholder for AI sentiment analysis
        # In a real implementation, you would call an AI service like OpenAI
        if not self.content:
            return
        
        # Simple keyword-based sentiment analysis for testing
        positive_words = ['happy', 'great', 'good', 'excellent', 'wonderful', 'amazing', 'fantastic']
        negative_words = ['sad', 'bad', 'terrible', 'awful', 'horrible', 'disappointed', 'angry']
        
        content_lower = self.content.lower()
        positive_count = sum(1 for word in positive_words if word in content_lower)
        negative_count = sum(1 for word in negative_words if word in content_lower)
        
        if positive_count > negative_count:
            self.sentiment = SentimentType.POSITIVE
            self.sentiment_score = 0.7
        elif negative_count > positive_count:
            self.sentiment = SentimentType.NEGATIVE
            self.sentiment_score = -0.5
        else:
            self.sentiment = SentimentType.NEUTRAL
            self.sentiment_score = 0.0
    
    def generate_ai_insights(self):
        """Generate AI insights and summary"""
        # This is a placeholder for AI insight generation
        # In a real implementation, you would call an AI service like OpenAI
        if not self.content:
            return
        
        # Simple insights for testing
        word_count = len(self.content.split())
        if word_count > 100:
            self.ai_insights = "This is a detailed journal entry with good reflection."
            self.ai_summary = f"Detailed entry about daily activities and thoughts ({word_count} words)."
        elif word_count > 50:
            self.ai_insights = "This is a moderate journal entry with some reflection."
            self.ai_summary = f"Moderate entry about daily activities ({word_count} words)."
        else:
            self.ai_insights = "This is a brief journal entry."
            self.ai_summary = f"Brief entry about daily activities ({word_count} words)."
    
    def to_dict(self, include_ai_data=False):
        """Convert journal entry to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'checkin_id': self.checkin_id,
            'content': self.content,
            'entry_date': self.entry_date.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        # Include mood rating from associated check-in if available
        if self.check_in and self.check_in.mood_rating:
            data['mood_rating'] = self.check_in.mood_rating
        else:
            data['mood_rating'] = None
        
        if include_ai_data:
            data.update({
                'sentiment': self.sentiment.value if self.sentiment else None,
                'sentiment_score': self.sentiment_score,
                'ai_insights': self.ai_insights,
                'ai_summary': self.ai_summary
            })
        
        return data
    
    def __repr__(self):
        return f'<JournalEntry {self.entry_date} {len(self.content)} chars>'
