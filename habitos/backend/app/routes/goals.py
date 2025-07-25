from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.goal import Goal, GoalType, GoalStatus
from app.models.habit import Habit
from app.utils.validation import validate_goal_status, validate_goal_type, get_enum_values
from datetime import datetime, date
import traceback
import sys

# Create blueprint for goal management routes
goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():
    """
    Get all goals for the current user with optional filters
    Supports filtering by habit and status
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Extract query parameters for filtering
        habit_id = request.args.get('habit_id')  # Filter by specific habit
        status = request.args.get('status')  # Filter by goal status

        # Start building the query for current user's goals
        query = Goal.query.filter_by(user_id=current_user_id)
        
        # Apply habit filter if provided
        if habit_id:
            query = query.filter_by(habit_id=habit_id)
        
        # Apply status filter if provided
        if status:
            try:
                # Validate status enum value
                validated_status = validate_goal_status(status)
                query = query.filter_by(status=GoalStatus(validated_status))
            except ValueError as e:
                return jsonify({'error': str(e)}), 400
        
        
        # Execute query with ordering (most recent first)
        goals = query.order_by(Goal.created_at.desc()).all()
        
        return jsonify({
            'goals': [goal.to_dict() for goal in goals],
            'count': len(goals)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch goals', 'details': str(e)}), 500

@goals_bp.route('/', methods=['POST'])
@jwt_required()
def create_goal():
    """
    Create a new goal
    Validates input data and creates a goal linked to a specific habit
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    if not data.get('habit_id'):
        return jsonify({'error': 'Habit ID is required'}), 400
    
    if not data.get('goal_type'):
        return jsonify({'error': 'Goal type is required'}), 400
    
    if not data.get('target_value'):
        return jsonify({'error': 'Target value is required'}), 400
    
    try:
        # Verify that the habit exists and belongs to the current user
        habit = Habit.query.filter_by(id=data['habit_id'], user_id=current_user_id).first()
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404
        
        # Check if a goal already exists for this habit
        existing_goal = Goal.query.filter_by(habit_id=data['habit_id'], user_id=current_user_id).first()
        if existing_goal:
            return jsonify({
                'error': 'A goal already exists for this habit',
                'existing_goal': existing_goal.to_dict()
            }), 409
        
        # Validate goal type enum value
        try:
            validated_goal_type = validate_goal_type(data['goal_type'])
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        
        # Validate status enum value (default to in_progress)
        status = data.get('status', 'in_progress')
        try:
            validated_status = validate_goal_status(status)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        # Parse due date if provided
        due_date = None
        if data.get('due_date'):
            try:
                due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid due_date format. Use YYYY-MM-DD'}), 400
        
        # Create new goal with validated data
        goal = Goal(
            user_id=current_user_id,
            habit_id=data['habit_id'],
            title=data['title'],
            description=data.get('description'),  # Optional field
            goal_type=GoalType(validated_goal_type),
            target_value=data['target_value'],
            target_unit=data.get('target_unit'),  # Optional field
            status=GoalStatus(validated_status),  # Use validated status
            due_date=due_date,
            reminder_enabled=data.get('reminder_enabled', True),  # Default to enabled
            reminder_days_before=data.get('reminder_days_before', 1)  # Default to 1 day
        )
        
        # Save goal to database
        db.session.add(goal)
        db.session.commit()
        
        return jsonify({
            'message': 'Goal created successfully',
            'goal': goal.to_dict()
        }), 201
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to create goal', 'details': str(e)}), 500

@goals_bp.route('/<goal_id>', methods=['GET'])
@jwt_required()
def get_goal(goal_id):
    """
    Get a specific goal by ID
    Returns detailed information about a single goal
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Find goal and ensure it belongs to the current user
        goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        return jsonify({'goal': goal.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch goal', 'details': str(e)}), 500

@goals_bp.route('/<goal_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_goal(goal_id):
    """
    Update a specific goal
    Allows updating goal properties while maintaining data integrity
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Find goal and ensure it belongs to the current user
        goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        # Update fields if provided in request data
        if 'title' in data:
            goal.title = data['title']
        
        if 'description' in data:
            goal.description = data['description']
        
        if 'target_value' in data:
            goal.target_value = data['target_value']
        
        if 'target_unit' in data:
            goal.target_unit = data['target_unit']
        
        if 'status' in data:
            try:
                # Validate status enum value
                validated_status = validate_goal_status(data['status'])
                goal.status = GoalStatus(validated_status)
                
                # Set completed_date if status is changed to completed
                if validated_status == 'completed' and not goal.completed_date:
                    goal.completed_date = date.today()
            except ValueError as e:
                return jsonify({'error': str(e)}), 400
        
        if 'due_date' in data:
            if data['due_date']:
                try:
                    # Parse due date string to date object
                    goal.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Invalid due_date format. Use YYYY-MM-DD'}), 400
            else:
                goal.due_date = None
        
        if 'reminder_enabled' in data:
            goal.reminder_enabled = data['reminder_enabled']
        
        if 'reminder_days_before' in data:
            goal.reminder_days_before = data['reminder_days_before']
        
        # Save changes to database
        db.session.commit()
        
        return jsonify({
            'message': 'Goal updated successfully',
            'goal': goal.to_dict()
        }), 200
        
    except Exception as e:
        print('--- Exception in update_goal PATCH route ---', file=sys.stderr)
        traceback.print_exc()
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to update goal', 'details': str(e)}), 500

@goals_bp.route('/<goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    """
    Delete a specific goal
    Removes goal from the database
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Find goal and ensure it belongs to the current user
        goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        # Delete goal from database
        db.session.delete(goal)
        db.session.commit()
        
        return jsonify({'message': 'Goal deleted successfully'}), 200
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to delete goal', 'details': str(e)}), 500

@goals_bp.route('/<goal_id>/progress', methods=['PUT'])
@jwt_required()
def update_goal_progress(goal_id):
    """
    Update goal progress
    Allows manual progress updates and checks for goal completion
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Find goal and ensure it belongs to the current user
        goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        # Update current value if provided
        if 'current_value' in data:
            goal.current_value = data['current_value']
            
            # Check if goal is completed based on current progress
            if goal.current_value >= goal.target_value and goal.status == GoalStatus.IN_PROGRESS.value:
                goal.status = GoalStatus.COMPLETED
                goal.completed_date = date.today()
        
        # Save changes to database
        db.session.commit()
        
        return jsonify({
            'message': 'Goal progress updated successfully',
            'goal': goal.to_dict()
        }), 200
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to update goal progress', 'details': str(e)}), 500

@goals_bp.route('/habit/<habit_id>', methods=['GET'])
@jwt_required()
def get_habit_goals(habit_id):
    """
    Get all goals for a specific habit
    Returns all goals associated with a particular habit
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Verify that the habit exists and belongs to the current user
        habit = Habit.query.filter_by(id=habit_id, user_id=current_user_id).first()
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404
        
        # Query all goals for this habit
        goals = Goal.query.filter_by(habit_id=habit_id, user_id=current_user_id).all()
        
        return jsonify({
            'habit_id': habit_id,
            'goals': [goal.to_dict() for goal in goals],
            'count': len(goals)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch habit goals', 'details': str(e)}), 500

@goals_bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_goals():
    """
    Get all active goals for the current user
    Returns goals that are currently in progress
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Use model method to get active goals
        goals = Goal.get_active_goals_for_user(current_user_id)
        
        return jsonify({
            'goals': [goal.to_dict() for goal in goals],
            'count': len(goals)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch active goals', 'details': str(e)}), 500

@goals_bp.route('/overdue', methods=['GET'])
@jwt_required()
def get_overdue_goals():
    """
    Get all overdue goals for the current user
    Returns goals that have passed their due date
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Use model method to get overdue goals
        goals = Goal.get_overdue_goals_for_user(current_user_id)
        
        return jsonify({
            'goals': [goal.to_dict() for goal in goals],
            'count': len(goals)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch overdue goals', 'details': str(e)}), 500

@goals_bp.route('/types', methods=['GET'])
@jwt_required()
def get_goal_types():
    """
    Get all available goal types
    Returns list of valid goal type options
    """
    # Convert enum values to user-friendly format
    goal_type_values = get_enum_values(GoalType)
    goal_types = [{'value': gt, 'label': gt.title()} for gt in goal_type_values]
    return jsonify({'goal_types': goal_types}), 200

@goals_bp.route('/statuses', methods=['GET'])
@jwt_required()
def get_goal_statuses():
    """
    Get all available goal statuses
    Returns list of valid goal status options
    """
    # Convert enum values to user-friendly format
    status_values = get_enum_values(GoalStatus)
    statuses = [{'value': s, 'label': s.title()} for s in status_values]
    return jsonify({'statuses': statuses}), 200

@goals_bp.route('/habit/<habit_id>/check', methods=['GET'])
@jwt_required()
def check_habit_goal(habit_id):
    """
    Check if a habit has an existing goal
    Returns goal information if exists, null if not
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Verify that the habit exists and belongs to the current user
        habit = Habit.query.filter_by(id=habit_id, user_id=current_user_id).first()
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404
        
        # Check if a goal exists for this habit
        goal = Goal.query.filter_by(habit_id=habit_id, user_id=current_user_id).first()
        
        return jsonify({
            'habit_id': habit_id,
            'has_goal': goal is not None,
            'goal': goal.to_dict() if goal else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to check habit goal', 'details': str(e)}), 500
