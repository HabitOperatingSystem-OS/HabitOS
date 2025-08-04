#!/usr/bin/env python3
"""
Test script for sentiment analysis functionality
"""

import os
import sys
import unittest
from datetime import datetime

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app, db
from app.models.journal_entry import JournalEntry, SentimentType
from app.utils.ai_service import get_ai_service

class TestSentimentAnalysis(unittest.TestCase):
    """Test cases for sentiment analysis functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Initialize AI service
        self.ai_service = get_ai_service()
        
        # Test content samples
        self.test_contents = {
            'positive': "Today was absolutely wonderful! I accomplished so much and felt great about my progress. Everything went perfectly and I'm so happy with how things turned out.",
            'negative': "Today was terrible. Nothing went right and I feel completely frustrated. I'm disappointed with myself and everything seems to be going wrong.",
            'neutral': "Today was a regular day. I went to work, had lunch, and came home. Nothing particularly exciting happened, but nothing bad either.",
            'very_positive': "This is the best day of my life! I'm overjoyed and ecstatic about everything that happened. I feel absolutely amazing and couldn't be happier!",
            'very_negative': "This is the worst day ever. I'm devastated and heartbroken. Everything is falling apart and I feel completely hopeless and miserable."
        }
    
    def tearDown(self):
        """Clean up test environment"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_ai_service_initialization(self):
        """Test that AI service initializes correctly"""
        self.assertIsNotNone(self.ai_service)
        # Note: In testing environment, AI service might be disabled due to missing API key
        # This is expected behavior
    
    def test_sentiment_analysis_positive_content(self):
        """Test sentiment analysis with positive content"""
        entry = JournalEntry(
            user_id="test-user",
            checkin_id="test-checkin",
            content=self.test_contents['positive']
        )
        
        # Analyze sentiment
        entry.analyze_sentiment()
        
        # Verify sentiment was set
        self.assertIsNotNone(entry.sentiment)
        self.assertIn(entry.sentiment, [SentimentType.POSITIVE, SentimentType.VERY_POSITIVE])
        self.assertIsNotNone(entry.sentiment_score)
        self.assertGreater(entry.sentiment_score, 0)
    
    def test_sentiment_analysis_negative_content(self):
        """Test sentiment analysis with negative content"""
        entry = JournalEntry(
            user_id="test-user",
            checkin_id="test-checkin",
            content=self.test_contents['negative']
        )
        
        # Analyze sentiment
        entry.analyze_sentiment()
        
        # Verify sentiment was set
        self.assertIsNotNone(entry.sentiment)
        self.assertIn(entry.sentiment, [SentimentType.NEGATIVE, SentimentType.VERY_NEGATIVE])
        self.assertIsNotNone(entry.sentiment_score)
        self.assertLess(entry.sentiment_score, 0)
    
    def test_sentiment_analysis_neutral_content(self):
        """Test sentiment analysis with neutral content"""
        entry = JournalEntry(
            user_id="test-user",
            checkin_id="test-checkin",
            content=self.test_contents['neutral']
        )
        
        # Analyze sentiment
        entry.analyze_sentiment()
        
        # Verify sentiment was set
        self.assertIsNotNone(entry.sentiment)
        self.assertEqual(entry.sentiment, SentimentType.NEUTRAL)
        self.assertIsNotNone(entry.sentiment_score)
        self.assertAlmostEqual(entry.sentiment_score, 0.0, places=1)
    
    def test_fallback_sentiment_analysis(self):
        """Test fallback sentiment analysis when AI is disabled"""
        entry = JournalEntry(
            user_id="test-user",
            checkin_id="test-checkin",
            content=self.test_contents['positive']
        )
        
        # Force fallback analysis by calling it directly
        entry._fallback_sentiment_analysis()
        
        # Verify sentiment was set
        self.assertIsNotNone(entry.sentiment)
        self.assertIsNotNone(entry.sentiment_score)
    
    def test_journal_entry_creation_with_sentiment(self):
        """Test that journal entries are created with sentiment analysis"""
        entry = JournalEntry(
            user_id="test-user",
            checkin_id="test-checkin",
            content=self.test_contents['positive']
        )
        
        # Save to database
        db.session.add(entry)
        db.session.commit()
        
        # Verify entry was saved
        self.assertIsNotNone(entry.id)
        
        # Analyze sentiment after saving
        entry.analyze_sentiment()
        db.session.commit()
        
        # Verify sentiment was set
        self.assertIsNotNone(entry.sentiment)
        self.assertIsNotNone(entry.sentiment_score)
    
    def test_sentiment_enum_values(self):
        """Test that sentiment enum values are correct"""
        expected_values = [
            'very_negative',
            'negative', 
            'neutral',
            'positive',
            'very_positive'
        ]
        
        actual_values = [s.value for s in SentimentType]
        self.assertEqual(actual_values, expected_values)
    
    def test_to_dict_with_sentiment(self):
        """Test that to_dict method includes sentiment data when requested"""
        entry = JournalEntry(
            user_id="test-user",
            checkin_id="test-checkin",
            content=self.test_contents['positive']
        )
        
        # Analyze sentiment
        entry.analyze_sentiment()
        
        # Test without AI data
        data_without_ai = entry.to_dict(include_ai_data=False)
        self.assertNotIn('sentiment', data_without_ai)
        self.assertNotIn('sentiment_score', data_without_ai)
        
        # Test with AI data
        data_with_ai = entry.to_dict(include_ai_data=True)
        self.assertIn('sentiment', data_with_ai)
        self.assertIn('sentiment_score', data_with_ai)
        self.assertIsNotNone(data_with_ai['sentiment'])
        self.assertIsNotNone(data_with_ai['sentiment_score'])

def run_sentiment_tests():
    """Run sentiment analysis tests"""
    print("Running sentiment analysis tests...")
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestSentimentAnalysis)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print(f"\nTest Results:")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print("\nFailures:")
        for test, traceback in result.failures:
            print(f"  {test}: {traceback}")
    
    if result.errors:
        print("\nErrors:")
        for test, traceback in result.errors:
            print(f"  {test}: {traceback}")
    
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_sentiment_tests()
    sys.exit(0 if success else 1) 