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
        """Analyze sentiment of the journal content using Gemini AI"""
        if not self.content:
            return
        
        try:
            from app.utils.gemini_service import get_gemini_service
            
            # Get sentiment analysis from Gemini
            gemini_service = get_gemini_service()
            sentiment_result = gemini_service.analyze_journal_sentiment(self.content)
            
            # Map sentiment to enum
            sentiment_mapping = {
                'very_negative': SentimentType.VERY_NEGATIVE,
                'negative': SentimentType.NEGATIVE,
                'neutral': SentimentType.NEUTRAL,
                'positive': SentimentType.POSITIVE,
                'very_positive': SentimentType.VERY_POSITIVE
            }
            
            self.sentiment = sentiment_mapping.get(sentiment_result['sentiment'], SentimentType.NEUTRAL)
            self.sentiment_score = sentiment_result['sentiment_score']
            
        except Exception as e:
            # Fallback to simple keyword-based analysis
            self._fallback_sentiment_analysis()
    
    def generate_ai_insights(self):
        """Generate AI insights and summary using Gemini"""
        if not self.content:
            return
        
        try:
            from app.utils.gemini_service import get_gemini_service
            
            # Get user context for personalized insights
            user_context = self._get_user_context()
            
            # Generate insights from Gemini
            gemini_service = get_gemini_service()
            insights_result = gemini_service.generate_journal_insights(self.content, user_context)
            
            # Store insights as JSON string
            import json
            self.ai_insights = json.dumps(insights_result, indent=2)
            self.ai_summary = insights_result.get('summary', '')
            
        except Exception as e:
            # Fallback to simple insights
            self._fallback_insights()
    
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
    
    def _fallback_sentiment_analysis(self):
        """Fallback sentiment analysis using simple keyword matching"""
        positive_words = ['happy', 'great', 'good', 'excellent', 'wonderful', 'amazing', 'fantastic', 'joy', 'love', 'excited']
        negative_words = ['sad', 'bad', 'terrible', 'awful', 'horrible', 'disappointed', 'angry', 'frustrated', 'anxious', 'worried']
        
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
    
    def _fallback_insights(self):
        """Fallback insights generation"""
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
            # Parse AI insights if it's JSON
            ai_insights_parsed = None
            if self.ai_insights:
                try:
                    import json
                    ai_insights_parsed = json.loads(self.ai_insights)
                except:
                    ai_insights_parsed = self.ai_insights
            
            data.update({
                'sentiment': self.sentiment.value if self.sentiment else None,
                'sentiment_score': self.sentiment_score,
                'ai_insights': ai_insights_parsed,
                'ai_summary': self.ai_summary
            })
        
        return data
    
    def __repr__(self):
        return f'<JournalEntry {self.entry_date} {len(self.content)} chars>'
