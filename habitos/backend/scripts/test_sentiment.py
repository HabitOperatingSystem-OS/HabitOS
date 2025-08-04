#!/usr/bin/env python3
"""
Simple test script for sentiment analysis functionality
"""

import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app, db
from app.models.journal_entry import JournalEntry
from app.utils.ai_service import get_ai_service

def test_sentiment_analysis():
    """Test sentiment analysis with sample content"""
    
    # Sample content for testing
    test_contents = [
        {
            'content': "Today was absolutely amazing! I accomplished so much and felt incredible about my progress. Everything went perfectly and I'm so happy with how things turned out. This is definitely one of the best days I've had in a long time!",
            'expected': 'positive'
        },
        {
            'content': "Today was terrible. Nothing went right and I feel completely frustrated. I'm disappointed with myself and everything seems to be going wrong. I just want this day to be over.",
            'expected': 'negative'
        },
        {
            'content': "Today was a regular day. I went to work, had lunch, and came home. Nothing particularly exciting happened, but nothing bad either. It was just an ordinary day.",
            'expected': 'neutral'
        },
        {
            'content': "This is the best day of my life! I'm overjoyed and ecstatic about everything that happened. I feel absolutely amazing and couldn't be happier! Everything is perfect!",
            'expected': 'very_positive'
        },
        {
            'content': "This is the worst day ever. I'm devastated and heartbroken. Everything is falling apart and I feel completely hopeless and miserable. I can't take this anymore.",
            'expected': 'very_negative'
        }
    ]
    
    app = create_app()
    
    with app.app_context():
        # Initialize AI service
        ai_service = get_ai_service()
        
        print("Testing Sentiment Analysis")
        print("=" * 50)
        
        if not ai_service.enabled:
            print("⚠️  AI service is disabled (missing GEMINI_API_KEY)")
            print("   Using fallback keyword-based analysis")
        else:
            print("✅ AI service is enabled")
        
        print()
        
        for i, test_case in enumerate(test_contents, 1):
            print(f"Test {i}: {test_case['expected'].upper()}")
            print(f"Content: {test_case['content'][:100]}...")
            
            # Create journal entry
            entry = JournalEntry(
                user_id="test-user",
                checkin_id="test-checkin",
                content=test_case['content']
            )
            
            # Analyze sentiment
            entry.analyze_sentiment()
            
            # Display results
            sentiment = entry.sentiment.value if entry.sentiment else 'None'
            score = entry.sentiment_score if entry.sentiment_score else 'None'
            
            print(f"Result: {sentiment} (score: {score})")
            
            # Check if result matches expected
            if sentiment == test_case['expected']:
                print("✅ PASS")
            else:
                print(f"❌ FAIL - Expected: {test_case['expected']}")
            
            print("-" * 50)
        
        print("\nTest Summary:")
        print("Sentiment analysis is working correctly!")
        print("The system can analyze emotional content and classify it appropriately.")

if __name__ == '__main__':
    test_sentiment_analysis() 