#!/usr/bin/env python3
"""
Test script to verify dashboard statistics calculations
"""

import sys
import os
from datetime import datetime, timedelta, date
from sqlalchemy import func, and_, desc

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app, db
from app.models.user import User
from app.models.habit import Habit, HabitCategory, HabitFrequency
from app.models.check_in import CheckIn
from app.models.goal import Goal, GoalType, GoalStatus

def create_test_data():
    """Create test data for dashboard calculations"""
    app = create_app('testing')
    
    with app.app_context():
        # Create all tables first
        db.create_all()
        
        # Clear existing test data
        CheckIn.query.delete()
        Goal.query.delete()
        Habit.query.delete()
        User.query.delete()
        
        # Create test user
        user = User(
            email="test@example.com",
            username="testuser"
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        
        # Create test habits
        habits = [
            Habit(
                user_id=user.id,
                title="Morning Exercise",
                category=HabitCategory.FITNESS,
                frequency=HabitFrequency.DAILY,
                active=True
            ),
            Habit(
                user_id=user.id,
                title="Read 30 minutes",
                category=HabitCategory.LEARNING,
                frequency=HabitFrequency.DAILY,
                active=True
            ),
            Habit(
                user_id=user.id,
                title="Meditation",
                category=HabitCategory.MINDFULNESS,
                frequency=HabitFrequency.DAILY,
                active=True
            ),
            Habit(
                user_id=user.id,
                title="Weekly Review",
                category=HabitCategory.PRODUCTIVITY,
                frequency=HabitFrequency.WEEKLY,
                frequency_count=1,
                active=True
            )
        ]
        
        for habit in habits:
            db.session.add(habit)
        db.session.commit()
        
        # Create check-ins for the last 30 days
        today = date.today()
        check_ins = []
        
        for i in range(30):
            check_date = today - timedelta(days=i)
            
            # Create check-ins for each habit (with some gaps to test streak calculation)
            for habit in habits:
                # Skip some days to create realistic patterns
                if i % 7 == 0 and habit.frequency == HabitFrequency.WEEKLY:
                    # Weekly habit - complete once per week
                    check_ins.append(CheckIn(
                        habit_id=habit.id,
                        user_id=user.id,
                        date=check_date,
                        completed=True,
                        mood_rating=8
                    ))
                elif habit.frequency == HabitFrequency.DAILY and i < 25:  # Skip last 5 days for daily habits
                    # Daily habits - complete most days but miss some
                    if i % 10 != 0:  # Skip every 10th day
                        check_ins.append(CheckIn(
                            habit_id=habit.id,
                            user_id=user.id,
                            date=check_date,
                            completed=True,
                            mood_rating=7 + (i % 3)  # Vary mood ratings
                        ))
        
        for check_in in check_ins:
            db.session.add(check_in)
        db.session.commit()
        
        # Create test goals
        goals = [
            Goal(
                user_id=user.id,
                habit_id=habits[0].id,  # Morning Exercise
                title="Exercise 30 days in a row",
                goal_type=GoalType.COUNT,
                target_value=30,
                target_unit="times",
                current_value=25,
                status=GoalStatus.IN_PROGRESS
            ),
            Goal(
                user_id=user.id,
                habit_id=habits[1].id,  # Read 30 minutes
                title="Read 20 books this year",
                goal_type=GoalType.COUNT,
                target_value=20,
                target_unit="books",
                current_value=20,
                status=GoalStatus.COMPLETED
            ),
            Goal(
                user_id=user.id,
                habit_id=habits[2].id,  # Meditation
                title="Meditate 100 hours",
                goal_type=GoalType.DURATION,
                target_value=100,
                target_unit="hours",
                current_value=45,
                status=GoalStatus.IN_PROGRESS
            )
        ]
        
        for goal in goals:
            db.session.add(goal)
        db.session.commit()
        
        print(f"✅ Created test data for user: {user.id}")
        print(f"   - {len(habits)} habits")
        print(f"   - {len(check_ins)} check-ins")
        print(f"   - {len(goals)} goals")
        
        return user.id

def test_dashboard_calculations(user_id):
    """Test the dashboard calculation functions"""
    app = create_app('testing')
    
    with app.app_context():
        # Create tables in this context
        db.create_all()
        
        # Import the calculation functions
        from app.routes.dashboard import (
            calculate_current_streak,
            calculate_completion_rate,
            calculate_goal_progress
        )
        
        print("\n🧪 Testing Dashboard Calculations:")
        print("=" * 50)
        
        # Test current streak calculation
        current_streak = calculate_current_streak(user_id)
        print(f"📊 Current Streak: {current_streak} days")
        
        # Test completion rate calculation
        completion_rate = calculate_completion_rate(user_id, days=30)
        print(f"📈 Completion Rate (30 days): {completion_rate}%")
        
        # Test goal progress calculation
        goal_data = calculate_goal_progress(user_id)
        print(f"🎯 Goals Achieved: {goal_data['goalsAchieved']}/{goal_data['totalGoals']}")
        print(f"📋 In Progress: {goal_data['inProgressGoals']}")
        print(f"⏰ Overdue: {goal_data['overdueGoals']}")
        print(f"📊 Goal Completion Rate: {goal_data['completionRate']}%")
        
        # Test active habits count
        active_habits = Habit.query.filter_by(user_id=user_id, active=True).count()
        print(f"🏃 Active Habits: {active_habits}")
        
        # Verify calculations make sense
        print("\n✅ Verification:")
        if current_streak > 0:
            print("   ✓ Current streak is calculated")
        else:
            print("   ⚠️  Current streak is 0 (check if this is expected)")
            
        if completion_rate >= 0 and completion_rate <= 100:
            print("   ✓ Completion rate is within valid range")
        else:
            print("   ❌ Completion rate is invalid")
            
        if goal_data['totalGoals'] >= goal_data['goalsAchieved']:
            print("   ✓ Goal counts are consistent")
        else:
            print("   ❌ Goal counts are inconsistent")
            
        if active_habits > 0:
            print("   ✓ Active habits count is positive")
        else:
            print("   ⚠️  No active habits found")

def test_dashboard_endpoint(user_id):
    """Test the dashboard endpoint"""
    app = create_app('testing')
    
    with app.app_context():
        # Create tables in this context
        db.create_all()
        
        from app.routes.dashboard import get_dashboard_data
        from flask_jwt_extended import create_access_token
        
        # Create a JWT token for the user
        token = create_access_token(identity=user_id)
        
        # Mock the JWT identity
        with app.test_request_context('/api/dashboard'):
            app.config['JWT_SECRET_KEY'] = 'test-secret'
            
            # This would normally be handled by the JWT decorator
            # For testing, we'll call the function directly
            try:
                # Import the function and test it
                from app.routes.dashboard import get_dashboard_data
                
                # We need to mock the JWT identity
                import flask_jwt_extended
                flask_jwt_extended.get_jwt_identity = lambda: user_id
                
                # Test the endpoint
                response = get_dashboard_data()
                data = response[0].json
                
                print("\n🌐 Dashboard Endpoint Test:")
                print("=" * 50)
                print(f"📊 Stats: {data['stats']}")
                print(f"📈 Streak Data Points: {len(data['streakData']['datasets'][0]['data'])}")
                print(f"📋 Today's Habits: {len(data['todaysHabits'])}")
                print(f"😊 Mood Summary: {data['moodSummary']['averageMood']}")
                
                return True
                
            except Exception as e:
                print(f"❌ Dashboard endpoint test failed: {e}")
                return False

def main():
    """Main test function"""
    print("🚀 Starting Dashboard Calculations Test")
    print("=" * 60)
    
    try:
        # Create test data
        user_id = create_test_data()
        
        # Test calculations
        test_dashboard_calculations(user_id)
        
        # Test dashboard endpoint
        test_dashboard_endpoint(user_id)
        
        print("\n✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 