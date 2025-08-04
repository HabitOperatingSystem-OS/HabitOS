#!/usr/bin/env python3
"""
Create test entries with different sentiments to verify filtering
"""
import os
from datetime import datetime, timezone
from app import create_app, db
from app.models.journal_entry import JournalEntry, SentimentType
from app.models.user import User
from app.models.check_in import CheckIn

def create_test_entries():
    """Create test entries with different sentiments"""
    
    print("🔧 Creating Test Entries")
    print("=" * 50)
    
    app = create_app('development')
    with app.app_context():
        
        # Find a user to create entries for
        user = User.query.first()
        if not user:
            print("❌ No users found in database")
            return
        
        print(f"Creating entries for user: {user.email}")
        
        # Find or create a check-in
        checkin = CheckIn.query.filter_by(user_id=user.id).first()
        if not checkin:
            print("❌ No check-ins found for user")
            return
        
        print(f"Using check-in: {checkin.id}")
        
        # Test entries with different sentiments
        test_entries = [
            {
                'content': 'I am feeling absolutely terrible today. Everything is going wrong and I hate my life.',
                'sentiment': SentimentType.VERY_NEGATIVE
            },
            {
                'content': 'Today was not great. I had some issues at work and felt frustrated.',
                'sentiment': SentimentType.NEGATIVE
            },
            {
                'content': 'Today was okay. Nothing special happened, just a regular day.',
                'sentiment': SentimentType.NEUTRAL
            },
            {
                'content': 'I had a good day today! Work went well and I felt productive.',
                'sentiment': SentimentType.POSITIVE
            },
            {
                'content': 'Today was absolutely amazing! I achieved all my goals, had great conversations, and feel on top of the world!',
                'sentiment': SentimentType.VERY_POSITIVE
            }
        ]
        
        created_count = 0
        for i, entry_data in enumerate(test_entries):
            try:
                # Check if entry already exists
                existing = JournalEntry.query.filter_by(
                    user_id=user.id,
                    content=entry_data['content']
                ).first()
                
                if existing:
                    print(f"  Entry {i+1} already exists, skipping...")
                    continue
                
                # Create new entry
                entry = JournalEntry(
                    user_id=user.id,
                    checkin_id=checkin.id,
                    content=entry_data['content'],
                    entry_date=datetime.now(timezone.utc).date(),
                    sentiment=entry_data['sentiment'],
                    sentiment_score=0.8 if 'positive' in entry_data['sentiment'].value else -0.8 if 'negative' in entry_data['sentiment'].value else 0.0
                )
                
                db.session.add(entry)
                created_count += 1
                print(f"  Created entry {i+1}: {entry_data['sentiment'].value}")
                
            except Exception as e:
                print(f"  ❌ Error creating entry {i+1}: {e}")
        
        # Commit all changes
        try:
            db.session.commit()
            print(f"\n✅ Successfully created {created_count} test entries")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error committing entries: {e}")
        
        # Verify the entries were created
        print("\n📊 Verifying created entries:")
        for sentiment in SentimentType:
            count = JournalEntry.query.filter_by(sentiment=sentiment.value).count()
            print(f"  {sentiment.value}: {count} entries")
        
        print("\n" + "=" * 50)

if __name__ == "__main__":
    create_test_entries() 