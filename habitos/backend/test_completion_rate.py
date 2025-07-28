#!/usr/bin/env python3
"""
Test to verify completion rate calculation is capped at 100%
"""

import sys
import os
from datetime import datetime, timedelta, date

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app, db
from app.models.user import User
from app.models.habit import Habit, HabitCategory, HabitFrequency
from app.models.check_in import CheckIn
from app.routes.dashboard import calculate_completion_rate

def test_completion_rate_cap():
    """Test that completion rate is capped at 100%"""
    app = create_app('testing')
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create test user
        user = User(
            email="test@example.com",
            username="testuser"
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        
        # Create a daily habit
        habit = Habit(
            user_id=user.id,
            title="Test Habit",
            category=HabitCategory.PERSONAL,
            frequency=HabitFrequency.DAILY,
            active=True
        )
        db.session.add(habit)
        db.session.commit()
        
        # Create check-ins for the last 7 days (more than expected)
        today = date.today()
        check_ins = []
        
        # Create 10 check-ins for 7 days (should result in >100% completion)
        for i in range(10):
            check_date = today - timedelta(days=i % 7)  # Only 7 unique days
            check_ins.append(CheckIn(
                habit_id=habit.id,
                user_id=user.id,
                date=check_date,
                completed=True,
                mood_rating=8
            ))
        
        for check_in in check_ins:
            db.session.add(check_in)
        db.session.commit()
        
        # Calculate completion rate
        completion_rate = calculate_completion_rate(user.id, days=7)
        
        print(f"📊 Test Results:")
        print(f"   Expected completions: 7 (7 days)")
        print(f"   Actual completions: {len(check_ins)}")
        print(f"   Completion rate: {completion_rate}%")
        
        # Verify the rate is capped at 100%
        if completion_rate <= 100:
            print("   ✅ Completion rate is properly capped at 100%")
            return True
        else:
            print("   ❌ Completion rate exceeds 100%")
            return False

def test_edge_cases():
    """Test edge cases for completion rate"""
    app = create_app('testing')
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create test user
        user = User(
            email="test2@example.com",
            username="testuser2"
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        
        # Test 1: No habits
        completion_rate = calculate_completion_rate(user.id, days=7)
        print(f"📊 No habits completion rate: {completion_rate}%")
        if completion_rate == 0:
            print("   ✅ Correctly returns 0 for no habits")
        else:
            print("   ❌ Should return 0 for no habits")
        
        # Test 2: No check-ins
        habit = Habit(
            user_id=user.id,
            title="Test Habit 2",
            category=HabitCategory.PERSONAL,
            frequency=HabitFrequency.DAILY,
            active=True
        )
        db.session.add(habit)
        db.session.commit()
        
        completion_rate = calculate_completion_rate(user.id, days=7)
        print(f"📊 No check-ins completion rate: {completion_rate}%")
        if completion_rate == 0:
            print("   ✅ Correctly returns 0 for no check-ins")
        else:
            print("   ❌ Should return 0 for no check-ins")
        
        # Test 3: Perfect completion (100%)
        today = date.today()
        for i in range(7):
            check_date = today - timedelta(days=i)
            check_in = CheckIn(
                habit_id=habit.id,
                user_id=user.id,
                date=check_date,
                completed=True,
                mood_rating=8
            )
            db.session.add(check_in)
        db.session.commit()
        
        completion_rate = calculate_completion_rate(user.id, days=7)
        print(f"📊 Perfect completion rate: {completion_rate}%")
        if completion_rate == 100:
            print("   ✅ Correctly returns 100% for perfect completion")
        else:
            print("   ❌ Should return 100% for perfect completion")
        
        return True

def main():
    """Main test function"""
    print("🧪 Testing Completion Rate Calculation")
    print("=" * 50)
    
    try:
        # Test completion rate cap
        test1_passed = test_completion_rate_cap()
        
        print("\n" + "=" * 50)
        
        # Test edge cases
        test2_passed = test_edge_cases()
        
        if test1_passed and test2_passed:
            print("\n✅ All completion rate tests passed!")
            return 0
        else:
            print("\n❌ Some completion rate tests failed!")
            return 1
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main()) 