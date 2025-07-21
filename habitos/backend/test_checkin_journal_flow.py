#!/usr/bin/env python3
"""
Test script to verify the check-in to journal entry flow
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

def test_checkin_journal_flow():
    """Test the complete check-in to journal entry flow"""
    
    print("🧪 Testing Check-in to Journal Flow")
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
    
    # Step 2: Get user's habits
    print("\n2. Getting user's habits...")
    try:
        habits_response = requests.get(f"{BASE_URL}/habits/", headers=headers)
        if habits_response.status_code == 200:
            habits = habits_response.json()
            if isinstance(habits, list):
                habits_list = habits
            else:
                habits_list = habits.get('habits', [])
            
            print(f"✅ Found {len(habits_list)} habits")
            if habits_list:
                habit = habits_list[0]
                print(f"   Using habit: {habit['title']} (ID: {habit['id']})")
            else:
                print("❌ No habits found. Please create a habit first.")
                return False
        else:
            print(f"❌ Failed to get habits: {habits_response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error getting habits: {e}")
        return False
    
    # Step 3: Create a bulk check-in with journal content
    print("\n3. Creating bulk check-in with journal reflection...")
    today = date.today().isoformat()
    
    bulk_checkin_data = {
        "date": today,
        "habits": [
            {
                "habit_id": habit['id'],
                "completed": True,
                "actual_value": 30.0
            }
        ],
        "mood_rating": 8,
        "journal_content": "Today was an amazing day! I completed my workout and felt really energized. The weather was perfect and I had a great time with friends. Looking forward to tomorrow!"
    }
    
    try:
        bulk_response = requests.post(f"{BASE_URL}/check-ins/bulk", json=bulk_checkin_data, headers=headers)
        if bulk_response.status_code == 201:
            result = bulk_response.json()
            print("✅ Bulk check-in created successfully")
            print(f"   Created: {result.get('created_count', 0)} check-ins")
            print(f"   Updated: {result.get('updated_count', 0)} check-ins")
            print(f"   Journal created: {result.get('journal_created', False)}")
            print(f"   Sentiment: {result.get('sentiment', 'None')}")
        else:
            print(f"❌ Failed to create bulk check-in: {bulk_response.status_code}")
            print(bulk_response.text)
            return False
    except Exception as e:
        print(f"❌ Error creating bulk check-in: {e}")
        return False
    
    # Step 4: Verify journal entries were created
    print("\n4. Checking journal entries...")
    try:
        journal_response = requests.get(f"{BASE_URL}/journal/?include_ai_data=true", headers=headers)
        if journal_response.status_code == 200:
            journal_data = journal_response.json()
            entries = journal_data.get('journal_entries', [])
            print(f"✅ Found {len(entries)} journal entries")
            
            if entries:
                latest_entry = entries[0]  # Most recent first
                print(f"   Latest entry date: {latest_entry['entry_date']}")
                print(f"   Content: {latest_entry['content'][:50]}...")
                print(f"   Checkin ID: {latest_entry.get('checkin_id', 'None')}")
                print(f"   Mood Rating: {latest_entry.get('mood_rating', 'None')}")
                print(f"   Sentiment: {latest_entry.get('sentiment', 'None')}")
                
                if latest_entry.get('checkin_id'):
                    print("✅ Journal entry is properly linked to check-in!")
                else:
                    print("❌ Journal entry is not linked to check-in")
                    
                if latest_entry.get('mood_rating'):
                    print(f"✅ Mood rating ({latest_entry['mood_rating']}) is available!")
                else:
                    print("❌ Mood rating is missing")
            else:
                print("❌ No journal entries found")
        else:
            print(f"❌ Failed to get journal entries: {journal_response.status_code}")
            print(journal_response.text)
    except Exception as e:
        print(f"❌ Error getting journal entries: {e}")
    
    # Step 5: Verify check-ins have mood ratings
    print("\n5. Checking today's check-ins...")
    try:
        checkins_response = requests.get(f"{BASE_URL}/check-ins/today", headers=headers)
        if checkins_response.status_code == 200:
            checkins_data = checkins_response.json()
            checkins = checkins_data.get('check_ins', [])
            print(f"✅ Found {len(checkins)} check-ins for today")
            
            for checkin in checkins:
                print(f"   Check-in ID: {checkin['id']}")
                print(f"   Mood Rating: {checkin.get('mood_rating', 'None')}")
                print(f"   Completed: {checkin['completed']}")
        else:
            print(f"❌ Failed to get today's check-ins: {checkins_response.status_code}")
    except Exception as e:
        print(f"❌ Error getting check-ins: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Check-in to journal flow test completed!")
    return True

if __name__ == "__main__":
    test_checkin_journal_flow() 