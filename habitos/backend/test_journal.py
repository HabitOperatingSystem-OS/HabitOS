#!/usr/bin/env python3
"""
Simple test script to verify journal functionality
"""

import requests
import json
from datetime import datetime, date

# Configuration
BASE_URL = "http://localhost:5001/api"
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123"
}

def test_journal_functionality():
    """Test the journal functionality"""
    
    print("🧪 Testing Journal Functionality")
    print("=" * 50)
    
    # Step 1: Login to get token
    print("\n1. Logging in...")
    try:
        login_response = requests.post(f"{BASE_URL}/auth/login", json=TEST_USER)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            print(login_response.text)
            return False
        
        token = login_response.json().get('access_token')
        headers = {'Authorization': f'Bearer {token}'}
        print("✅ Login successful")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the backend is running.")
        return False
    
    # Step 2: Get available sentiments
    print("\n2. Getting available sentiments...")
    try:
        sentiments_response = requests.get(f"{BASE_URL}/journal/sentiments", headers=headers)
        if sentiments_response.status_code == 200:
            sentiments = sentiments_response.json().get('sentiments', [])
            print(f"✅ Found {len(sentiments)} sentiment types:")
            for sentiment in sentiments:
                print(f"   - {sentiment['label']} ({sentiment['value']})")
        else:
            print(f"❌ Failed to get sentiments: {sentiments_response.status_code}")
    except Exception as e:
        print(f"❌ Error getting sentiments: {e}")
    
    # Step 3: Create a test journal entry
    print("\n3. Creating test journal entry...")
    test_entry = {
        "content": "Today was a great day! I completed all my tasks and felt very productive. The weather was nice and I had a good workout.",
        "entry_date": date.today().isoformat()
    }
    
    try:
        create_response = requests.post(f"{BASE_URL}/journal/", json=test_entry, headers=headers)
        if create_response.status_code == 201:
            entry_data = create_response.json().get('journal_entry')
            print("✅ Journal entry created successfully")
            print(f"   Entry ID: {entry_data['id']}")
            print(f"   Content: {entry_data['content'][:50]}...")
            if entry_data.get('sentiment'):
                print(f"   Sentiment: {entry_data['sentiment']}")
            if entry_data.get('ai_summary'):
                print(f"   AI Summary: {entry_data['ai_summary']}")
        else:
            print(f"❌ Failed to create journal entry: {create_response.status_code}")
            print(create_response.text)
    except Exception as e:
        print(f"❌ Error creating journal entry: {e}")
    
    # Step 4: Get all journal entries
    print("\n4. Getting all journal entries...")
    try:
        entries_response = requests.get(f"{BASE_URL}/journal/?include_ai_data=true", headers=headers)
        if entries_response.status_code == 200:
            entries_data = entries_response.json()
            entries = entries_data.get('journal_entries', [])
            print(f"✅ Found {len(entries)} journal entries")
            
            if entries:
                latest_entry = entries[0]  # Most recent first
                print(f"   Latest entry: {latest_entry['entry_date']}")
                print(f"   Content: {latest_entry['content'][:50]}...")
                if latest_entry.get('mood_rating'):
                    print(f"   Mood Rating: {latest_entry['mood_rating']}/10")
                if latest_entry.get('sentiment'):
                    print(f"   Sentiment: {latest_entry['sentiment']}")
        else:
            print(f"❌ Failed to get journal entries: {entries_response.status_code}")
            print(entries_response.text)
    except Exception as e:
        print(f"❌ Error getting journal entries: {e}")
    
    # Step 5: Test sentiment analysis
    print("\n5. Testing sentiment analysis...")
    test_text = "I'm feeling really happy today! Everything is going well."
    
    try:
        sentiment_response = requests.post(f"{BASE_URL}/journal/sentiment-analysis", 
                                         json={"content": test_text}, 
                                         headers=headers)
        if sentiment_response.status_code == 200:
            sentiment_data = sentiment_response.json()
            print("✅ Sentiment analysis successful")
            print(f"   Sentiment: {sentiment_data.get('sentiment')}")
            print(f"   Score: {sentiment_data.get('sentiment_score')}")
            if sentiment_data.get('ai_summary'):
                print(f"   AI Summary: {sentiment_data['ai_summary']}")
        else:
            print(f"❌ Failed to analyze sentiment: {sentiment_response.status_code}")
    except Exception as e:
        print(f"❌ Error analyzing sentiment: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Journal functionality test completed!")
    return True

if __name__ == "__main__":
    test_journal_functionality() 