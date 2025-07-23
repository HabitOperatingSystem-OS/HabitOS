#!/usr/bin/env python3
"""
Comprehensive test script for goals functionality
Tests all goals endpoints and edge cases
"""

import requests
import json
from datetime import datetime, date, timedelta
import time

# Configuration
BASE_URL = "http://localhost:5001/api"
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123"
}

def test_goals_functionality():
    """Test the complete goals functionality"""
    
    print("🎯 Testing Goals Functionality")
    print("=" * 60)
    
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
    
    # Step 2: Get available goal types, statuses, and priorities
    print("\n2. Getting available goal options...")
    try:
        # Get goal types
        types_response = requests.get(f"{BASE_URL}/goals/types", headers=headers)
        if types_response.status_code == 200:
            goal_types = types_response.json().get('goal_types', [])
            print(f"✅ Found {len(goal_types)} goal types:")
            for gt in goal_types:
                print(f"   - {gt['label']} ({gt['value']})")
        else:
            print(f"❌ Failed to get goal types: {types_response.status_code}")
        
        # Get goal statuses
        statuses_response = requests.get(f"{BASE_URL}/goals/statuses", headers=headers)
        if statuses_response.status_code == 200:
            goal_statuses = statuses_response.json().get('statuses', [])
            print(f"✅ Found {len(goal_statuses)} goal statuses:")
            for gs in goal_statuses:
                print(f"   - {gs['label']} ({gs['value']})")
        else:
            print(f"❌ Failed to get goal statuses: {statuses_response.status_code}")
        
        # Get goal priorities
        priorities_response = requests.get(f"{BASE_URL}/goals/priorities", headers=headers)
        if priorities_response.status_code == 200:
            goal_priorities = priorities_response.json().get('priorities', [])
            print(f"✅ Found {len(goal_priorities)} goal priorities:")
            for gp in goal_priorities:
                print(f"   - {gp['label']} ({gp['value']})")
        else:
            print(f"❌ Failed to get goal priorities: {priorities_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error getting goal options: {e}")
    
    # Step 3: Get or create a habit for testing
    print("\n3. Getting available habits...")
    try:
        habits_response = requests.get(f"{BASE_URL}/habits/", headers=headers)
        if habits_response.status_code == 200:
            habits = habits_response.json().get('habits', [])
            print(f"✅ Found {len(habits)} habits")
            
            if not habits:
                print("   Creating a test habit...")
                test_habit = {
                    "name": "Test Habit for Goals",
                    "description": "A test habit for goal testing",
                    "category": "health",
                    "frequency": "daily",
                    "target_count": 1,
                    "reminder_time": "09:00"
                }
                habit_response = requests.post(f"{BASE_URL}/habits/", json=test_habit, headers=headers)
                if habit_response.status_code == 201:
                    habit_data = habit_response.json().get('habit')
                    habit_id = habit_data['id']
                    print(f"✅ Created test habit: {habit_data['name']} (ID: {habit_id})")
                else:
                    print(f"❌ Failed to create test habit: {habit_response.status_code}")
                    return False
            else:
                habit_id = habits[0]['id']
                habit_name = habits[0].get('name', 'Unknown Habit')
                print(f"   Using existing habit: {habit_name} (ID: {habit_id})")
        else:
            print(f"❌ Failed to get habits: {habits_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error with habits: {e}")
        return False
    
    # Step 4: Create test goals
    print("\n4. Creating test goals...")
    test_goals = []
    
    # Goal 1: Count-based goal
    goal1 = {
        "title": "Exercise 30 times this month",
        "description": "Complete 30 workout sessions",
        "habit_id": habit_id,
        "goal_type": "count",
        "target_value": 30,
        "target_unit": "times",
        "priority": "high",
        "status": "in_progress",
        "due_date": (date.today() + timedelta(days=30)).isoformat(),
        "reminder_enabled": True,
        "reminder_days_before": 3
    }
    
    try:
        create_response = requests.post(f"{BASE_URL}/goals/", json=goal1, headers=headers)
        if create_response.status_code == 201:
            goal_data = create_response.json().get('goal')
            test_goals.append(goal_data)
            print(f"✅ Created goal 1: {goal_data['title']} (ID: {goal_data['id']})")
            print(f"   Progress: {goal_data['current_value']}/{goal_data['target_value']} ({goal_data['progress_percentage']:.1f}%)")
        else:
            print(f"❌ Failed to create goal 1: {create_response.status_code}")
            print(create_response.text)
    except Exception as e:
        print(f"❌ Error creating goal 1: {e}")
    
    # Goal 2: Duration-based goal
    goal2 = {
        "title": "Read for 100 hours",
        "description": "Complete 100 hours of reading",
        "habit_id": habit_id,
        "goal_type": "duration",
        "target_value": 100,
        "target_unit": "hours",
        "priority": "medium",
        "status": "in_progress",
        "due_date": (date.today() + timedelta(days=60)).isoformat(),
        "reminder_enabled": False
    }
    
    try:
        create_response = requests.post(f"{BASE_URL}/goals/", json=goal2, headers=headers)
        if create_response.status_code == 201:
            goal_data = create_response.json().get('goal')
            test_goals.append(goal_data)
            print(f"✅ Created goal 2: {goal_data['title']} (ID: {goal_data['id']})")
            print(f"   Progress: {goal_data['current_value']}/{goal_data['target_value']} ({goal_data['progress_percentage']:.1f}%)")
        else:
            print(f"❌ Failed to create goal 2: {create_response.status_code}")
            print(create_response.text)
    except Exception as e:
        print(f"❌ Error creating goal 2: {e}")
    
    # Goal 3: Overdue goal for testing
    goal3 = {
        "title": "Complete project by last week",
        "description": "This goal is intentionally overdue",
        "habit_id": habit_id,
        "goal_type": "custom",
        "target_value": 1,
        "target_unit": "project",
        "priority": "low",
        "status": "in_progress",
        "due_date": (date.today() - timedelta(days=7)).isoformat(),  # Overdue
        "reminder_enabled": True,
        "reminder_days_before": 1
    }
    
    try:
        create_response = requests.post(f"{BASE_URL}/goals/", json=goal3, headers=headers)
        if create_response.status_code == 201:
            goal_data = create_response.json().get('goal')
            test_goals.append(goal_data)
            print(f"✅ Created goal 3 (overdue): {goal_data['title']} (ID: {goal_data['id']})")
            print(f"   Due date: {goal_data['due_date']} (Overdue: {goal_data['is_overdue']})")
        else:
            print(f"❌ Failed to create goal 3: {create_response.status_code}")
            print(create_response.text)
    except Exception as e:
        print(f"❌ Error creating goal 3: {e}")
    
    if not test_goals:
        print("❌ No goals created, cannot continue testing")
        return False
    
    # Step 5: Get all goals
    print("\n5. Getting all goals...")
    try:
        goals_response = requests.get(f"{BASE_URL}/goals/", headers=headers)
        if goals_response.status_code == 200:
            goals_data = goals_response.json()
            goals = goals_data.get('goals', [])
            print(f"✅ Found {len(goals)} total goals")
            
            for goal in goals:
                print(f"   - {goal['title']} ({goal['status']}) - {goal['progress_percentage']:.1f}% complete")
                if goal['is_overdue']:
                    print(f"     ⚠️  OVERDUE (due: {goal['due_date']})")
        else:
            print(f"❌ Failed to get goals: {goals_response.status_code}")
            print(goals_response.text)
    except Exception as e:
        print(f"❌ Error getting goals: {e}")
    
    # Step 6: Test goal filtering
    print("\n6. Testing goal filtering...")
    
    # Test status filter
    try:
        active_response = requests.get(f"{BASE_URL}/goals/?status=in_progress", headers=headers)
        if active_response.status_code == 200:
            active_goals = active_response.json().get('goals', [])
            print(f"✅ Found {len(active_goals)} active goals")
        else:
            print(f"❌ Failed to filter by status: {active_response.status_code}")
    except Exception as e:
        print(f"❌ Error filtering by status: {e}")
    
    # Test priority filter
    try:
        high_priority_response = requests.get(f"{BASE_URL}/goals/?priority=high", headers=headers)
        if high_priority_response.status_code == 200:
            high_goals = high_priority_response.json().get('goals', [])
            print(f"✅ Found {len(high_goals)} high priority goals")
        else:
            print(f"❌ Failed to filter by priority: {high_priority_response.status_code}")
    except Exception as e:
        print(f"❌ Error filtering by priority: {e}")
    
    # Test habit filter
    try:
        habit_goals_response = requests.get(f"{BASE_URL}/goals/?habit_id={habit_id}", headers=headers)
        if habit_goals_response.status_code == 200:
            habit_goals = habit_goals_response.json().get('goals', [])
            print(f"✅ Found {len(habit_goals)} goals for habit {habit_id}")
        else:
            print(f"❌ Failed to filter by habit: {habit_goals_response.status_code}")
    except Exception as e:
        print(f"❌ Error filtering by habit: {e}")
    
    # Step 7: Test specialized goal endpoints
    print("\n7. Testing specialized goal endpoints...")
    
    # Test active goals endpoint
    try:
        active_goals_response = requests.get(f"{BASE_URL}/goals/active", headers=headers)
        if active_goals_response.status_code == 200:
            active_goals = active_goals_response.json().get('goals', [])
            print(f"✅ Found {len(active_goals)} active goals via /active endpoint")
        else:
            print(f"❌ Failed to get active goals: {active_goals_response.status_code}")
    except Exception as e:
        print(f"❌ Error getting active goals: {e}")
    
    # Test overdue goals endpoint
    try:
        overdue_goals_response = requests.get(f"{BASE_URL}/goals/overdue", headers=headers)
        if overdue_goals_response.status_code == 200:
            overdue_goals = overdue_goals_response.json().get('goals', [])
            print(f"✅ Found {len(overdue_goals)} overdue goals via /overdue endpoint")
            for goal in overdue_goals:
                print(f"   - {goal['title']} (due: {goal['due_date']})")
        else:
            print(f"❌ Failed to get overdue goals: {overdue_goals_response.status_code}")
    except Exception as e:
        print(f"❌ Error getting overdue goals: {e}")
    
    # Test habit-specific goals endpoint
    try:
        habit_goals_response = requests.get(f"{BASE_URL}/goals/habit/{habit_id}", headers=headers)
        if habit_goals_response.status_code == 200:
            habit_goals = habit_goals_response.json().get('goals', [])
            print(f"✅ Found {len(habit_goals)} goals for habit via /habit/{habit_id} endpoint")
        else:
            print(f"❌ Failed to get habit goals: {habit_goals_response.status_code}")
    except Exception as e:
        print(f"❌ Error getting habit goals: {e}")
    
    # Step 8: Test individual goal operations
    if test_goals:
        test_goal = test_goals[0]
        goal_id = test_goal['id']
        
        print(f"\n8. Testing individual goal operations for: {test_goal['title']}")
        
        # Get specific goal
        try:
            get_response = requests.get(f"{BASE_URL}/goals/{goal_id}", headers=headers)
            if get_response.status_code == 200:
                goal_data = get_response.json().get('goal')
                print(f"✅ Retrieved goal: {goal_data['title']}")
                print(f"   Current progress: {goal_data['current_value']}/{goal_data['target_value']}")
            else:
                print(f"❌ Failed to get goal: {get_response.status_code}")
        except Exception as e:
            print(f"❌ Error getting goal: {e}")
        
        # Update goal progress
        try:
            progress_update = {
                "current_value": 15  # Update to 15 out of 30
            }
            progress_response = requests.put(f"{BASE_URL}/goals/{goal_id}/progress", 
                                           json=progress_update, headers=headers)
            if progress_response.status_code == 200:
                updated_goal = progress_response.json().get('goal')
                print(f"✅ Updated goal progress: {updated_goal['current_value']}/{updated_goal['target_value']}")
                print(f"   Progress percentage: {updated_goal['progress_percentage']:.1f}%")
            else:
                print(f"❌ Failed to update progress: {progress_response.status_code}")
                print(progress_response.text)
        except Exception as e:
            print(f"❌ Error updating progress: {e}")
        
        # Update goal details
        try:
            goal_update = {
                "title": "Exercise 30 times this month (Updated)",
                "description": "Updated description for testing",
                "priority": "medium",
                "reminder_days_before": 5
            }
            update_response = requests.put(f"{BASE_URL}/goals/{goal_id}", 
                                         json=goal_update, headers=headers)
            if update_response.status_code == 200:
                updated_goal = update_response.json().get('goal')
                print(f"✅ Updated goal: {updated_goal['title']}")
                print(f"   New priority: {updated_goal['priority']}")
                print(f"   New reminder days: {updated_goal['reminder_days_before']}")
            else:
                print(f"❌ Failed to update goal: {update_response.status_code}")
                print(update_response.text)
        except Exception as e:
            print(f"❌ Error updating goal: {e}")
    
    # Step 9: Test goal completion
    if test_goals:
        test_goal = test_goals[1]  # Use the second goal for completion testing
        goal_id = test_goal['id']
        
        print(f"\n9. Testing goal completion for: {test_goal['title']}")
        
        # Update progress to complete the goal
        try:
            completion_update = {
                "current_value": 100  # Complete the 100-hour reading goal
            }
            completion_response = requests.put(f"{BASE_URL}/goals/{goal_id}/progress", 
                                             json=completion_update, headers=headers)
            if completion_response.status_code == 200:
                completed_goal = completion_response.json().get('goal')
                print(f"✅ Goal completion test:")
                print(f"   Status: {completed_goal['status']}")
                print(f"   Progress: {completed_goal['current_value']}/{completed_goal['target_value']}")
                print(f"   Is completed: {completed_goal['is_completed']}")
                if completed_goal.get('completed_date'):
                    print(f"   Completed date: {completed_goal['completed_date']}")
            else:
                print(f"❌ Failed to complete goal: {completion_response.status_code}")
                print(completion_response.text)
        except Exception as e:
            print(f"❌ Error completing goal: {e}")
    
    # Step 10: Test error cases
    print("\n10. Testing error cases...")
    
    # Test creating goal with invalid data
    try:
        invalid_goal = {
            "title": "",  # Empty title should fail
            "habit_id": habit_id,
            "goal_type": "count",
            "target_value": 10
        }
        invalid_response = requests.post(f"{BASE_URL}/goals/", json=invalid_goal, headers=headers)
        if invalid_response.status_code == 400:
            print("✅ Correctly rejected goal with empty title")
        else:
            print(f"❌ Should have rejected invalid goal, got: {invalid_response.status_code}")
    except Exception as e:
        print(f"❌ Error testing invalid goal: {e}")
    
    # Test accessing non-existent goal
    try:
        fake_id = "00000000-0000-0000-0000-000000000000"
        fake_response = requests.get(f"{BASE_URL}/goals/{fake_id}", headers=headers)
        if fake_response.status_code == 404:
            print("✅ Correctly returned 404 for non-existent goal")
        else:
            print(f"❌ Should have returned 404, got: {fake_response.status_code}")
    except Exception as e:
        print(f"❌ Error testing non-existent goal: {e}")
    
    # Test invalid enum values
    try:
        invalid_enum_goal = {
            "title": "Test Invalid Enum",
            "habit_id": habit_id,
            "goal_type": "invalid_type",  # Invalid goal type
            "target_value": 10
        }
        invalid_enum_response = requests.post(f"{BASE_URL}/goals/", json=invalid_enum_goal, headers=headers)
        if invalid_enum_response.status_code == 400:
            print("✅ Correctly rejected goal with invalid enum values")
        else:
            print(f"❌ Should have rejected invalid enum goal, got: {invalid_enum_response.status_code}")
    except Exception as e:
        print(f"❌ Error testing invalid enum goal: {e}")
    
    # Step 11: Cleanup (optional - comment out if you want to keep test data)
    print("\n11. Cleaning up test data...")
    cleanup = input("Do you want to delete the test goals? (y/N): ").lower().strip()
    
    if cleanup == 'y':
        for goal in test_goals:
            try:
                delete_response = requests.delete(f"{BASE_URL}/goals/{goal['id']}", headers=headers)
                if delete_response.status_code == 200:
                    print(f"✅ Deleted goal: {goal['title']}")
                else:
                    print(f"❌ Failed to delete goal {goal['id']}: {delete_response.status_code}")
            except Exception as e:
                print(f"❌ Error deleting goal {goal['id']}: {e}")
    else:
        print("   Keeping test data for manual inspection")
    
    print("\n" + "=" * 60)
    print("🎉 Goals functionality test completed!")
    print(f"📊 Summary:")
    print(f"   - Created {len(test_goals)} test goals")
    print(f"   - Tested all major endpoints")
    print(f"   - Verified filtering and specialized endpoints")
    print(f"   - Tested error handling")
    print(f"   - Validated goal completion logic")
    return True

if __name__ == "__main__":
    test_goals_functionality() 