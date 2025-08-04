#!/usr/bin/env python3
"""
Debug script to test sentiment filtering and check existing data
"""
import os
from app import create_app, db
from app.models.journal_entry import JournalEntry, SentimentType

def debug_sentiment_filtering():
    """Debug sentiment filtering functionality"""
    
    print("🔍 Debugging Sentiment Filtering")
    print("=" * 50)
    
    app = create_app('development')
    with app.app_context():
        
        # Check total entries
        total_entries = JournalEntry.query.count()
        print(f"Total journal entries: {total_entries}")
        
        # Check entries by sentiment
        print("\n📊 Entries by sentiment:")
        for sentiment in SentimentType:
            count = JournalEntry.query.filter_by(sentiment=sentiment).count()
            print(f"  {sentiment.value}: {count}")
        
        # Check entries with no sentiment
        null_count = JournalEntry.query.filter_by(sentiment=None).count()
        print(f"  NULL: {null_count}")
        
        # Test filtering logic
        print("\n🧪 Testing filter queries:")
        
        # Test very_negative filter
        very_negative_entries = JournalEntry.query.filter_by(sentiment=SentimentType.VERY_NEGATIVE).all()
        print(f"  very_negative filter: {len(very_negative_entries)} entries")
        
        # Test positive filter
        positive_entries = JournalEntry.query.filter_by(sentiment=SentimentType.POSITIVE).all()
        print(f"  positive filter: {len(positive_entries)} entries")
        
        # Test neutral filter
        neutral_entries = JournalEntry.query.filter_by(sentiment=SentimentType.NEUTRAL).all()
        print(f"  neutral filter: {len(neutral_entries)} entries")
        
        # Show some sample entries
        print("\n📝 Sample entries with sentiment:")
        entries_with_sentiment = JournalEntry.query.filter(JournalEntry.sentiment.isnot(None)).limit(5).all()
        for entry in entries_with_sentiment:
            print(f"  ID: {entry.id[:8]}... | Sentiment: {entry.sentiment.value if entry.sentiment else 'NULL'} | Content: {entry.content[:50]}...")
        
        # Test the exact query that would be used in the API
        print("\n🔍 Testing API-style query:")
        from sqlalchemy import text
        
        # Simulate the API query
        sentiment_param = "very_negative"
        query = JournalEntry.query
        
        if sentiment_param:
            try:
                sentiment_enum = SentimentType(sentiment_param)
                query = query.filter_by(sentiment=sentiment_enum)
                print(f"  Filtering by sentiment: {sentiment_param}")
                
                # Execute the query
                results = query.all()
                print(f"  Results: {len(results)} entries")
                
                if results:
                    print("  Sample result:")
                    entry = results[0]
                    print(f"    ID: {entry.id}")
                    print(f"    Sentiment: {entry.sentiment.value}")
                    print(f"    Content: {entry.content[:100]}...")
                else:
                    print("  No entries found with this sentiment")
                    
            except ValueError as e:
                print(f"  Error: Invalid sentiment value '{sentiment_param}': {e}")
        
        print("\n" + "=" * 50)
        print("✅ Debug complete!")

if __name__ == "__main__":
    debug_sentiment_filtering() 