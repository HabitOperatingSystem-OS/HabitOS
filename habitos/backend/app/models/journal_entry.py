from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    check_in_id = db.Column(db.Integer, db.ForeignKey('check_ins.id'), nullable=True)
    
    # Journal content
    content = db.Column(db.Text, nullable=False)
    mood_rating = db.Column(db.Integer)  # 1-10 scale
    
    # AI Analysis (stretch feature)
    sentiment_score = db.Column(db.Float)  # -1 to 1
    sentiment_label = db.Column(db.String(20))  # positive, negative, neutral
    ai_insights = db.Column(db.Text)
    
    # Metadata
    entry_date = db.Column(db.Date, default=datetime.utcnow().date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'check_in_id': self.check_in_id,
            'content': self.content,
            'mood_rating': self.mood_rating,
            'sentiment_score': self.sentiment_score,
            'sentiment_label': self.sentiment_label,
            'ai_insights': self.ai_insights,
            'entry_date': self.entry_date.isoformat() if self.entry_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
