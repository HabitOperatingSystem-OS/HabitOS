#!/usr/bin/env python3
"""
Simple test to verify dashboard API endpoint
"""

import requests
import json
import time

def test_dashboard_api():
    """Test the dashboard API endpoint"""
    base_url = "http://localhost:5001/api"
    
    print("🧪 Testing Dashboard API")
    print("=" * 50)
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"✅ Server is running: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Server not running: {e}")
        return False
    
    # Test 2: Try to access dashboard without auth (should fail)
    try:
        response = requests.get(f"{base_url}/dashboard", timeout=5)
        print(f"📊 Dashboard without auth: {response.status_code} (expected 401)")
        if response.status_code == 401:
            print("   ✅ Correctly requires authentication")
        else:
            print("   ⚠️  Unexpected response")
    except requests.exceptions.RequestException as e:
        print(f"❌ Dashboard request failed: {e}")
    
    # Test 3: Check if we can get a proper error response
    try:
        response = requests.get(f"{base_url}/dashboard", timeout=5)
        if response.status_code == 401:
            error_data = response.json()
            print(f"   📋 Error message: {error_data.get('msg', 'No message')}")
    except Exception as e:
        print(f"   ❌ Error parsing response: {e}")
    
    print("\n✅ Dashboard API test completed!")
    print("\n📝 Next steps:")
    print("   1. Create a user account")
    print("   2. Login to get JWT token")
    print("   3. Test dashboard with authentication")
    
    return True

if __name__ == "__main__":
    test_dashboard_api() 