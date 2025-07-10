from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.goal import Goal, GoalType, GoalStatus, GoalPriority
from app.models.habit import Habit
from datetime import datetime, date

# Create blueprint for goal management routes
goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():
    """
    Get all goals for the current user with optional filters
    Supports filtering by habit, status, and priority
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Extract query parameters for filtering
        habit_id = request.args.get('habit_id')  # Filter by specific habit
        status = request.args.get('status')  # Filter by goal status
        priority = request.args.get('priority')  # Filter by goal priority
        
        # Start building the query for current user's goals
        query = Goal.query.filter_by(user_id=current_user_id)
        
        # Apply habit filter if provided
        if habit_id:
            query = query.filter_by(habit_id=habit_id)
        
        # Apply status filter if provided
        if status:
            # Validate status enum value
            if status not in [s.value for s in GoalStatus]:
                return jsonify({'error': 'Invalid status'}), 400
            query = query.filter_by(status=GoalStatus(status))
        
        # Apply priority filter if provided
        if priority:
            # Validate priority enum value
            if priority not in [p.value for p in GoalPriority]:
                return jsonify({'error': 'Invalid priority'}), 400
            query = query.filter_by(priority=GoalPriority(priority))
        
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
        
        # Validate goal type enum value
        if data['goal_type'] not in [gt.value for gt in GoalType]:
            return jsonify({'error': 'Invalid goal type'}), 400
        
        # Validate priority enum value (default to medium)
        priority = data.get('priority', 'medium')
        if priority not in [p.value for p in GoalPriority]:
            return jsonify({'error': 'Invalid priority'}), 400
        
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
            goal_type=GoalType(data['goal_type']),
            target_value=data['target_value'],
            target_unit=data.get('target_unit'),  # Optional field
            priority=GoalPriority(priority),
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

@goals_bp.route('/<goal_id>', methods=['PUT'])
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
        
        if 'priority' in data:
            # Validate priority enum value
            if data['priority'] not in [p.value for p in GoalPriority]:
                return jsonify({'error': 'Invalid priority'}), 400
            goal.priority = GoalPriority(data['priority'])
        
        if 'status' in data:
            # Validate status enum value
            if data['status'] not in [s.value for s in GoalStatus]:
                return jsonify({'error': 'Invalid status'}), 400
            goal.status = GoalStatus(data['status'])
            
            # Set completed_date if status is changed to completed
            if data['status'] == 'completed' and not goal.completed_date:
                goal.completed_date = date.today()
        
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
            if goal.current_value >= goal.target_value and goal.status == GoalStatus.ACTIVE:
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
    goal_types = [{'value': gt.value, 'label': gt.value.title()} for gt in GoalType]
    return jsonify({'goal_types': goal_types}), 200

@goals_bp.route('/statuses', methods=['GET'])
@jwt_required()
def get_goal_statuses():
    """
    Get all available goal statuses
    Returns list of valid goal status options
    """
    # Convert enum values to user-friendly format
    statuses = [{'value': s.value, 'label': s.value.title()} for s in GoalStatus]
    return jsonify({'statuses': statuses}), 200

@goals_bp.route('/priorities', methods=['GET'])
@jwt_required()
def get_goal_priorities():
    """
    Get all available goal priorities
    Returns list of valid goal priority options
    """
    # Convert enum values to user-friendly format
    priorities = [{'value': p.value, 'label': p.value.title()} for p in GoalPriority]
    return jsonify({'priorities': priorities}), 200
