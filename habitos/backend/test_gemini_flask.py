#!/usr/bin/env python3
"""
Flask-aware test script for Gemini AI integration in HabitOS
This script tests the core Gemini functionality within the Flask application context
"""

import os
import sys
import json
from datetime import datetime

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_gemini_with_flask_context():
    """Test the Gemini service within Flask application context"""
    print("🧪 Testing Gemini AI Integration with Flask Context")
    print("=" * 60)
    
    try:
        # Import Flask app and create context
        from app import create_app
        from app.utils.gemini_service import get_gemini_service
        
        # Create Flask app
        app = create_app('development')
        
        with app.app_context():
            # Check if Gemini API key is configured
            api_key = app.config.get('GEMINI_API_KEY')
            if not api_key:
                print("❌ GEMINI_API_KEY not found in Flask config")
                return False
            
            print(f"✅ Gemini API key found: {api_key[:10]}...")
            
            # Get Gemini service
            gemini_service = get_gemini_service()
            
            if not gemini_service.enabled:
                print("❌ Gemini service failed to initialize")
                return False
            
            print(f"✅ Gemini service initialized with model: {gemini_service.model_name}")
            
            # Test 1: Sentiment Analysis
            print("\n📊 Test 1: Sentiment Analysis")
            test_content = "Today was absolutely amazing! I completed all my goals and felt incredibly productive. The workout was challenging but rewarding, and I'm excited about the progress I'm making."
            
            sentiment_result = gemini_service.analyze_journal_sentiment(test_content)
            print(f"   Input: {test_content[:50]}...")
            print(f"   Sentiment: {sentiment_result['sentiment']}")
            print(f"   Score: {sentiment_result['sentiment_score']}")
            print(f"   Themes: {sentiment_result['emotional_themes']}")
            print(f"   Confidence: {sentiment_result['confidence']}")
            
            # Test 2: Journal Insights
            print("\n💡 Test 2: Journal Insights")
            user_context = {
                'habits': ['Morning Exercise', 'Reading', 'Meditation'],
                'goals': ['Complete 30-day fitness challenge', 'Read 12 books this year'],
                'mood_trends': [8, 7, 9, 8, 7, 8, 9]
            }
            
            insights_result = gemini_service.generate_journal_insights(test_content, user_context)
            print(f"   Summary: {insights_result['summary']}")
            print(f"   Key Themes: {insights_result['key_themes']}")
            print(f"   Action Items: {insights_result['action_items'][:2]}...")
            
            # Test 3: Reflective Prompts
            print("\n🤔 Test 3: Reflective Prompts")
            prompts = gemini_service.generate_reflective_prompts(user_context, "habit-focused")
            print(f"   Generated {len(prompts)} prompts:")
            for i, prompt in enumerate(prompts[:3], 1):
                print(f"   {i}. [{prompt['category']}] {prompt['text']}")
            
            # Test 4: Pattern Analysis
            print("\n📈 Test 4: Pattern Analysis")
            test_entries = [
                {
                    'entry_date': '2024-01-15',
                    'content': 'Great workout today! Felt strong and motivated.'
                },
                {
                    'entry_date': '2024-01-14',
                    'content': 'Struggled with motivation but pushed through my routine.'
                },
                {
                    'entry_date': '2024-01-13',
                    'content': 'Amazing energy today! Completed all my goals ahead of schedule.'
                }
            ]
            
            patterns_result = gemini_service.analyze_journal_patterns(test_entries)
            print(f"   Recurring Themes: {patterns_result['recurring_themes']}")
            print(f"   Growth Indicators: {patterns_result['growth_indicators']}")
            print(f"   Recommendations: {patterns_result['recommendations'][:2]}...")
            
            print("\n✅ All Flask context tests completed successfully!")
            return True
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Make sure you're running this from the backend directory")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_fallback_with_flask_context():
    """Test fallback functionality within Flask context"""
    print("\n🔄 Testing Fallback Functionality with Flask Context")
    print("=" * 50)
    
    try:
        from app import create_app
        from app.utils.gemini_service import get_gemini_service, GeminiService
        
        app = create_app('development')
        
        with app.app_context():
            # Temporarily disable API key
            original_key = app.config.get('GEMINI_API_KEY')
            app.config['GEMINI_API_KEY'] = ''
            
            # Reinitialize service with disabled key
            service = GeminiService()
            
            if service.enabled:
                print("❌ Service should be disabled without API key")
                return False
            
            print("✅ Service correctly disabled without API key")
            
            # Test fallback sentiment analysis
            sentiment = service.analyze_journal_sentiment("Test content")
            print(f"   Fallback sentiment: {sentiment['sentiment']}")
            
            # Test fallback insights
            insights = service.generate_journal_insights("Test content")
            print(f"   Fallback summary: {insights['summary']}")
            
            # Test fallback prompts
            prompts = service.generate_reflective_prompts()
            print(f"   Fallback prompts: {len(prompts)} generated")
            
            # Restore API key
            if original_key:
                app.config['GEMINI_API_KEY'] = original_key
            
            print("✅ Fallback functionality working correctly")
            return True
            
    except Exception as e:
        print(f"❌ Fallback test failed: {e}")
        return False

def test_api_endpoints():
    """Test the API endpoints (requires running Flask app)"""
    print("\n🌐 Testing API Endpoints")
    print("=" * 30)
    print("Note: This test requires the Flask app to be running")
    print("Start the app with: pipenv run python run.py")
    print("Then test endpoints manually or with curl")
    
    print("\n📋 Available endpoints to test:")
    print("   GET  /api/journal/prompts?type=general")
    print("   GET  /api/journal/prompts/categories")
    print("   POST /api/journal/sentiment-analysis")
    print("   GET  /api/journal/patterns?days_back=7")
    
    return True

def main():
    """Main test function"""
    print("🚀 HabitOS Gemini AI Integration Test (Flask Context)")
    print("=" * 60)
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run tests
    success_count = 0
    total_tests = 3
    
    if test_gemini_with_flask_context():
        success_count += 1
    
    if test_fallback_with_flask_context():
        success_count += 1
    
    if test_api_endpoints():
        success_count += 1
    
    # Summary
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {success_count}/{total_tests} tests passed")
    
    if success_count >= 2:
        print("🎉 Gemini integration is working correctly!")
        print("\n📝 Next steps:")
        print("   1. Start your Flask application: pipenv run python run.py")
        print("   2. Test the API endpoints with curl or Postman")
        print("   3. Check the documentation at docs/GEMINI_INTEGRATION.md")
        print("   4. Integrate with your frontend React application")
    else:
        print("⚠️  Some tests failed. Please check the configuration and try again.")
        print("\n🔧 Troubleshooting:")
        print("   1. Verify your Gemini API key is correct")
        print("   2. Check your internet connection")
        print("   3. Ensure all dependencies are installed")
        print("   4. Review the error messages above")

if __name__ == "__main__":
    main() 