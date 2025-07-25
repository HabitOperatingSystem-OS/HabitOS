"""
Unit tests for goals functionality
"""

import pytest
import json
from datetime import datetime, date, timedelta
from app import create_app, db
from app.models.user import User
from app.models.habit import Habit, HabitCategory, HabitFrequency
from app.models.goal import Goal, GoalType, GoalStatus, GoalPriority
from app.utils.validation import validate_goal_status, validate_goal_priority, validate_goal_type

@pytest.fixture
def app():
    """Create application for testing"""
    app = create_app('testing')
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    """Create authenticated headers"""
    # Create test user
    user = User(
        email="test@example.com",
        username="testuser"
    )
    user.set_password("testpassword123")
    db.session.add(user)
    db.session.commit()
    
    # Login to get token
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    response = client.post('/api/auth/login', json=login_data)
    token = response.json['access_token']
    
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }, user.id

@pytest.fixture
def test_habit(auth_headers):
    """Create a test habit"""
    headers, user_id = auth_headers
    
    habit = Habit(
        user_id=user_id,
        title="Test Habit",
        category=HabitCategory.HEALTH,
        frequency=HabitFrequency.DAILY
    )
    db.session.add(habit)
    db.session.commit()
    
    return habit

class TestGoalValidation:
    """Test goal validation functions"""
    
    def test_validate_goal_status_valid(self):
        """Test valid goal status validation"""
        assert validate_goal_status("in_progress") == "in_progress"
        assert validate_goal_status("completed") == "completed"
        assert validate_goal_status("abandoned") == "abandoned"
        assert validate_goal_status("active") == "in_progress"  # Frontend mapping
    
    def test_validate_goal_status_invalid(self):
        """Test invalid goal status validation"""
        with pytest.raises(ValueError):
            validate_goal_status("invalid_status")
    
    def test_validate_goal_priority_valid(self):
        """Test valid goal priority validation"""
        assert validate_goal_priority("low") == "low"
        assert validate_goal_priority("medium") == "medium"
        assert validate_goal_priority("high") == "high"
    
    def test_validate_goal_priority_invalid(self):
        """Test invalid goal priority validation"""
        with pytest.raises(ValueError):
            validate_goal_priority("invalid_priority")
    
    def test_validate_goal_type_valid(self):
        """Test valid goal type validation"""
        assert validate_goal_type("count") == "count"
        assert validate_goal_type("duration") == "duration"
        assert validate_goal_type("distance") == "distance"
        assert validate_goal_type("weight") == "weight"
        assert validate_goal_type("custom") == "custom"
    
    def test_validate_goal_type_invalid(self):
        """Test invalid goal type validation"""
        with pytest.raises(ValueError):
            validate_goal_type("invalid_type")

class TestGoalModel:
    """Test Goal model functionality"""
    
    def test_goal_creation(self, app, test_habit):
        """Test goal creation"""
        with app.app_context():
            goal = Goal(
                user_id=test_habit.user_id,
                habit_id=test_habit.id,
                title="Test Goal",
                description="A test goal",
                goal_type=GoalType.COUNT,
                target_value=10,
                target_unit="times",
                priority=GoalPriority.MEDIUM,
                status=GoalStatus.IN_PROGRESS
            )
            db.session.add(goal)
            db.session.commit()
            
            assert goal.id is not None
            assert goal.title == "Test Goal"
            assert goal.current_value == 0
            assert goal.progress_percentage() == 0.0
            assert not goal.is_completed()
            assert not goal.is_overdue()
    
    def test_goal_progress_calculation(self, app, test_habit):
        """Test goal progress calculation"""
        with app.app_context():
            goal = Goal(
                user_id=test_habit.user_id,
                habit_id=test_habit.id,
                title="Test Goal",
                goal_type=GoalType.COUNT,
                target_value=100,
                current_value=50
            )
            db.session.add(goal)
            db.session.commit()
            
            assert goal.progress_percentage() == 50.0
            assert not goal.is_completed()
            
            # Update to complete
            goal.current_value = 100
            assert goal.progress_percentage() == 100.0
            assert goal.is_completed()
    
    def test_goal_overdue_detection(self, app, test_habit):
        """Test goal overdue detection"""
        with app.app_context():
            # Create overdue goal
            goal = Goal(
                user_id=test_habit.user_id,
                habit_id=test_habit.id,
                title="Overdue Goal",
                goal_type=GoalType.COUNT,
                target_value=10,
                due_date=date.today() - timedelta(days=1),
                status=GoalStatus.IN_PROGRESS
            )
            db.session.add(goal)
            db.session.commit()
            
            assert goal.is_overdue()
            
            # Test non-overdue goal
            goal2 = Goal(
                user_id=test_habit.user_id,
                habit_id=test_habit.id,
                title="Future Goal",
                goal_type=GoalType.COUNT,
                target_value=10,
                due_date=date.today() + timedelta(days=1),
                status=GoalStatus.IN_PROGRESS
            )
            db.session.add(goal2)
            db.session.commit()
            
            assert not goal2.is_overdue()
    
    def test_goal_to_dict(self, app, test_habit):
        """Test goal serialization"""
        with app.app_context():
            goal = Goal(
                user_id=test_habit.user_id,
                habit_id=test_habit.id,
                title="Test Goal",
                description="A test goal",
                goal_type=GoalType.COUNT,
                target_value=10,
                target_unit="times",
                priority=GoalPriority.HIGH,
                status=GoalStatus.IN_PROGRESS
            )
            db.session.add(goal)
            db.session.commit()
            
            goal_dict = goal.to_dict()
            
            assert goal_dict['id'] == goal.id
            assert goal_dict['title'] == "Test Goal"
            assert goal_dict['goal_type'] == "count"
            assert goal_dict['priority'] == "high"
            assert goal_dict['status'] == "in_progress"
            assert 'progress_percentage' in goal_dict
            assert 'is_completed' in goal_dict
            assert 'is_overdue' in goal_dict

class TestGoalsAPI:
    """Test goals API endpoints"""
    
    def test_get_goal_types(self, client, auth_headers):
        """Test getting goal types"""
        headers, _ = auth_headers
        response = client.get('/api/goals/types', headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert 'goal_types' in data
        assert len(data['goal_types']) == 5  # count, duration, distance, weight, custom
    
    def test_get_goal_statuses(self, client, auth_headers):
        """Test getting goal statuses"""
        headers, _ = auth_headers
        response = client.get('/api/goals/statuses', headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert 'statuses' in data
        assert len(data['statuses']) == 3  # in_progress, completed, abandoned
    
    def test_get_goal_priorities(self, client, auth_headers):
        """Test getting goal priorities"""
        headers, _ = auth_headers
        response = client.get('/api/goals/priorities', headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert 'priorities' in data
        assert len(data['priorities']) == 3  # low, medium, high
    
    def test_create_goal_success(self, client, auth_headers, test_habit):
        """Test successful goal creation"""
        headers, _ = auth_headers
        
        goal_data = {
            "title": "Test Goal",
            "description": "A test goal",
            "habit_id": test_habit.id,
            "goal_type": "count",
            "target_value": 10,
            "target_unit": "times",
            "priority": "high",
            "status": "in_progress",
            "due_date": (date.today() + timedelta(days=30)).isoformat()
        }
        
        response = client.post('/api/goals/', json=goal_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json
        assert 'goal' in data
        assert data['goal']['title'] == "Test Goal"
        assert data['goal']['goal_type'] == "count"
        assert data['goal']['priority'] == "high"
    
    def test_create_goal_missing_required_fields(self, client, auth_headers, test_habit):
        """Test goal creation with missing required fields"""
        headers, _ = auth_headers
        
        # Missing title
        goal_data = {
            "habit_id": test_habit.id,
            "goal_type": "count",
            "target_value": 10
        }
        
        response = client.post('/api/goals/', json=goal_data, headers=headers)
        assert response.status_code == 400
        assert 'Title is required' in response.json['error']
    
    def test_create_goal_invalid_enum_values(self, client, auth_headers, test_habit):
        """Test goal creation with invalid enum values"""
        headers, _ = auth_headers
        
        goal_data = {
            "title": "Test Goal",
            "habit_id": test_habit.id,
            "goal_type": "invalid_type",
            "target_value": 10
        }
        
        response = client.post('/api/goals/', json=goal_data, headers=headers)
        assert response.status_code == 400
    
    def test_get_goals_empty(self, client, auth_headers):
        """Test getting goals when none exist"""
        headers, _ = auth_headers
        response = client.get('/api/goals/', headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert data['goals'] == []
        assert data['count'] == 0
    
    def test_get_goals_with_data(self, client, auth_headers, test_habit):
        """Test getting goals with existing data"""
        headers, user_id = auth_headers
        
        # Create test goals
        goal1 = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Goal 1",
            goal_type=GoalType.COUNT,
            target_value=10,
            priority=GoalPriority.HIGH
        )
        goal2 = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Goal 2",
            goal_type=GoalType.DURATION,
            target_value=100,
            priority=GoalPriority.MEDIUM
        )
        
        db.session.add_all([goal1, goal2])
        db.session.commit()
        
        response = client.get('/api/goals/', headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert len(data['goals']) == 2
        assert data['count'] == 2
    
    def test_get_goals_with_filters(self, client, auth_headers, test_habit):
        """Test getting goals with filters"""
        headers, user_id = auth_headers
        
        # Create test goals with different priorities
        goal1 = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="High Priority Goal",
            goal_type=GoalType.COUNT,
            target_value=10,
            priority=GoalPriority.HIGH
        )
        goal2 = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Low Priority Goal",
            goal_type=GoalType.COUNT,
            target_value=10,
            priority=GoalPriority.LOW
        )
        
        db.session.add_all([goal1, goal2])
        db.session.commit()
        
        # Test priority filter
        response = client.get('/api/goals/?priority=high', headers=headers)
        assert response.status_code == 200
        data = response.json
        assert len(data['goals']) == 1
        assert data['goals'][0]['priority'] == 'high'
    
    def test_get_goal_by_id(self, client, auth_headers, test_habit):
        """Test getting a specific goal"""
        headers, user_id = auth_headers
        
        goal = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Test Goal",
            goal_type=GoalType.COUNT,
            target_value=10
        )
        db.session.add(goal)
        db.session.commit()
        
        response = client.get(f'/api/goals/{goal.id}', headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert data['goal']['id'] == goal.id
        assert data['goal']['title'] == "Test Goal"
    
    def test_get_goal_by_id_not_found(self, client, auth_headers):
        """Test getting non-existent goal"""
        headers, _ = auth_headers
        fake_id = "00000000-0000-0000-0000-000000000000"
        
        response = client.get(f'/api/goals/{fake_id}', headers=headers)
        assert response.status_code == 404
    
    def test_update_goal(self, client, auth_headers, test_habit):
        """Test updating a goal"""
        headers, user_id = auth_headers
        
        goal = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Original Title",
            goal_type=GoalType.COUNT,
            target_value=10,
            priority=GoalPriority.LOW
        )
        db.session.add(goal)
        db.session.commit()
        
        update_data = {
            "title": "Updated Title",
            "priority": "high",
            "description": "Updated description"
        }
        
        response = client.put(f'/api/goals/{goal.id}', json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert data['goal']['title'] == "Updated Title"
        assert data['goal']['priority'] == "high"
        assert data['goal']['description'] == "Updated description"
    
    def test_update_goal_progress(self, client, auth_headers, test_habit):
        """Test updating goal progress"""
        headers, user_id = auth_headers
        
        goal = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Test Goal",
            goal_type=GoalType.COUNT,
            target_value=10,
            current_value=0
        )
        db.session.add(goal)
        db.session.commit()
        
        progress_data = {
            "current_value": 5
        }
        
        response = client.put(f'/api/goals/{goal.id}/progress', json=progress_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert data['goal']['current_value'] == 5
        assert data['goal']['progress_percentage'] == 50.0
    
    def test_update_goal_progress_completion(self, client, auth_headers, test_habit):
        """Test goal completion through progress update"""
        headers, user_id = auth_headers
        
        goal = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Test Goal",
            goal_type=GoalType.COUNT,
            target_value=10,
            current_value=0,
            status=GoalStatus.IN_PROGRESS
        )
        db.session.add(goal)
        db.session.commit()
        
        progress_data = {
            "current_value": 10
        }
        
        response = client.put(f'/api/goals/{goal.id}/progress', json=progress_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert data['goal']['status'] == "completed"
        assert data['goal']['is_completed'] == True
        assert data['goal']['completed_date'] is not None
    
    def test_delete_goal(self, client, auth_headers, test_habit):
        """Test deleting a goal"""
        headers, user_id = auth_headers
        
        goal = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Test Goal",
            goal_type=GoalType.COUNT,
            target_value=10
        )
        db.session.add(goal)
        db.session.commit()
        
        response = client.delete(f'/api/goals/{goal.id}', headers=headers)
        
        assert response.status_code == 200
        assert response.json['message'] == "Goal deleted successfully"
        
        # Verify goal is deleted
        get_response = client.get(f'/api/goals/{goal.id}', headers=headers)
        assert get_response.status_code == 404
    
    def test_get_active_goals(self, client, auth_headers, test_habit):
        """Test getting active goals"""
        headers, user_id = auth_headers
        
        # Create goals with different statuses
        active_goal = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Active Goal",
            goal_type=GoalType.COUNT,
            target_value=10,
            status=GoalStatus.IN_PROGRESS
        )
        completed_goal = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Completed Goal",
            goal_type=GoalType.COUNT,
            target_value=10,
            status=GoalStatus.COMPLETED
        )
        
        db.session.add_all([active_goal, completed_goal])
        db.session.commit()
        
        response = client.get('/api/goals/active', headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert len(data['goals']) == 1
        assert data['goals'][0]['title'] == "Active Goal"
    
    def test_get_overdue_goals(self, client, auth_headers, test_habit):
        """Test getting overdue goals"""
        headers, user_id = auth_headers
        
        # Create overdue goal
        overdue_goal = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Overdue Goal",
            goal_type=GoalType.COUNT,
            target_value=10,
            due_date=date.today() - timedelta(days=1),
            status=GoalStatus.IN_PROGRESS
        )
        
        db.session.add(overdue_goal)
        db.session.commit()
        
        response = client.get('/api/goals/overdue', headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert len(data['goals']) == 1
        assert data['goals'][0]['title'] == "Overdue Goal"
        assert data['goals'][0]['is_overdue'] == True
    
    def test_get_habit_goals(self, client, auth_headers, test_habit):
        """Test getting goals for a specific habit"""
        headers, user_id = auth_headers
        
        # Create another habit
        habit2 = Habit(
            user_id=user_id,
            title="Test Habit 2",
            category=HabitCategory.PRODUCTIVITY,
            frequency=HabitFrequency.DAILY
        )
        db.session.add(habit2)
        db.session.commit()
        
        # Create goals for different habits
        goal1 = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="Goal for Habit 1",
            goal_type=GoalType.COUNT,
            target_value=10
        )
        goal2 = Goal(
            user_id=user_id,
            habit_id=habit2.id,
            title="Goal for Habit 2",
            goal_type=GoalType.COUNT,
            target_value=10
        )
        
        db.session.add_all([goal1, goal2])
        db.session.commit()
        
        response = client.get(f'/api/goals/habit/{test_habit.id}', headers=headers)
        
        assert response.status_code == 200
        data = response.json
        assert len(data['goals']) == 1
        assert data['goals'][0]['title'] == "Goal for Habit 1"
        assert data['habit_id'] == test_habit.id

class TestGoalsAuthorization:
    """Test goals authorization and security"""
    
    def test_goals_require_authentication(self, client):
        """Test that goals endpoints require authentication"""
        response = client.get('/api/goals/')
        assert response.status_code == 401
    
    def test_user_cannot_access_other_user_goals(self, client, auth_headers, test_habit):
        """Test that users cannot access other users' goals"""
        headers, user_id = auth_headers
        
        # Create goal for current user
        goal = Goal(
            user_id=user_id,
            habit_id=test_habit.id,
            title="My Goal",
            goal_type=GoalType.COUNT,
            target_value=10
        )
        db.session.add(goal)
        db.session.commit()
        
        # Create another user
        other_user = User(
            email="other@example.com",
            username="otheruser"
        )
        other_user.set_password("password123")
        db.session.add(other_user)
        db.session.commit()
        
        # Try to access goal with other user's token
        other_login_data = {
            "email": "other@example.com",
            "password": "password123"
        }
        other_response = client.post('/api/auth/login', json=other_login_data)
        other_token = other_response.json['access_token']
        other_headers = {'Authorization': f'Bearer {other_token}'}
        
        response = client.get(f'/api/goals/{goal.id}', headers=other_headers)
        assert response.status_code == 404  # Should not find the goal 