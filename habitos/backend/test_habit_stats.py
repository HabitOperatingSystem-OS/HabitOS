#!/usr/bin/env python3
"""
Test to verify habit stats endpoint
"""

import requests
import json

def test_habit_stats_api():
    """Test the habit stats API endpoint"""
    base_url = "http://localhost:5001/api"
    
    print("🧪 Testing Habit Stats API")
    print("=" * 50)
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"✅ Server is running: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Server not running: {e}")
        return False
    
    # Test 2: Try to access habit stats without auth (should fail)
    try:
        response = requests.get(f"{base_url}/habits/stats", timeout=5)
        print(f"📊 Habit stats without auth: {response.status_code} (expected 401)")
        if response.status_code == 401:
            print("   ✅ Correctly requires authentication")
        else:
            print("   ⚠️  Unexpected response")
    except requests.exceptions.RequestException as e:
        print(f"❌ Habit stats request failed: {e}")
    
    # Test 3: Check habits endpoint
    try:
        response = requests.get(f"{base_url}/habits/", timeout=5)
        print(f"📋 Habits endpoint: {response.status_code} (expected 401)")
        if response.status_code == 401:
            print("   ✅ Correctly requires authentication")
        else:
            print("   ⚠️  Unexpected response")
    except requests.exceptions.RequestException as e:
        print(f"❌ Habits request failed: {e}")
    
    print("\n✅ Habit Stats API test completed!")
    print("\n📝 Next steps:")
    print("   1. Create a user account")
    print("   2. Login to get JWT token")
    print("   3. Test habit stats with authentication")
    
    return True

if __name__ == "__main__":
    test_habit_stats_api() 