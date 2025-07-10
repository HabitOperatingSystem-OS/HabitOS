from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.habit import Habit, HabitCategory, HabitFrequency

# Create blueprint for habit management routes
habits_bp = Blueprint('habits', __name__)

@habits_bp.route('/', methods=['GET'])
@jwt_required()
def get_habits():
    """
    Get all habits for the current user
    Returns a list of all habits belonging to the authenticated user
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Query all habits for the current user
        habits = Habit.query.filter_by(user_id=current_user_id).all()
        
        return jsonify({
            'habits': [habit.to_dict() for habit in habits],
            'count': len(habits)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch habits', 'details': str(e)}), 500

@habits_bp.route('/', methods=['POST'])
@jwt_required()
def create_habit():
    """
    Create a new habit
    Validates input data and creates a new habit for the authenticated user
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields - title is mandatory
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    try:
        # Validate category enum value
        category = data.get('category', 'personal')  # Default to personal
        if category not in [cat.value for cat in HabitCategory]:
            return jsonify({'error': 'Invalid category'}), 400
        
        # Validate frequency enum value
        frequency = data.get('frequency', 'daily')  # Default to daily
        if frequency not in [freq.value for freq in HabitFrequency]:
            return jsonify({'error': 'Invalid frequency'}), 400
        
        # Create new habit instance with validated data
        habit = Habit(
            user_id=current_user_id,
            title=data['title'],
            category=HabitCategory(category),
            frequency=HabitFrequency(frequency),
            frequency_count=data.get('frequency_count', 1)  # Default to 1
        )
        
        # Save habit to database
        db.session.add(habit)
        db.session.commit()
        
        return jsonify({
            'message': 'Habit created successfully',
            'habit': habit.to_dict()
        }), 201
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to create habit', 'details': str(e)}), 500

@habits_bp.route('/<habit_id>', methods=['GET'])
@jwt_required()
def get_habit(habit_id):
    """
    Get a specific habit by ID
    Returns detailed information about a single habit
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Query habit by ID and ensure it belongs to the current user
        habit = Habit.query.filter_by(id=habit_id, user_id=current_user_id).first()
        
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404
        
        return jsonify({'habit': habit.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch habit', 'details': str(e)}), 500

@habits_bp.route('/<habit_id>', methods=['PUT'])
@jwt_required()
def update_habit(habit_id):
    """
    Update a specific habit
    Allows updating habit properties while maintaining data integrity
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Find habit and ensure it belongs to the current user
        habit = Habit.query.filter_by(id=habit_id, user_id=current_user_id).first()
        
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404
        
        # Update fields if provided in request data
        if 'title' in data:
            habit.title = data['title']
        
        if 'category' in data:
            # Validate category enum value
            if data['category'] not in [cat.value for cat in HabitCategory]:
                return jsonify({'error': 'Invalid category'}), 400
            habit.category = HabitCategory(data['category'])
        
        if 'frequency' in data:
            # Validate frequency enum value
            if data['frequency'] not in [freq.value for freq in HabitFrequency]:
                return jsonify({'error': 'Invalid frequency'}), 400
            habit.frequency = HabitFrequency(data['frequency'])
        
        if 'frequency_count' in data:
            habit.frequency_count = data['frequency_count']
        
        # Save changes to database
        db.session.commit()
        
        return jsonify({
            'message': 'Habit updated successfully',
            'habit': habit.to_dict()
        }), 200
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to update habit', 'details': str(e)}), 500

@habits_bp.route('/<habit_id>', methods=['DELETE'])
@jwt_required()
def delete_habit(habit_id):
    """
    Delete a specific habit
    Removes habit and all associated data (check-ins, goals, etc.)
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Find habit and ensure it belongs to the current user
        habit = Habit.query.filter_by(id=habit_id, user_id=current_user_id).first()
        
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404
        
        # Delete habit (cascade will handle related data)
        db.session.delete(habit)
        db.session.commit()
        
        return jsonify({'message': 'Habit deleted successfully'}), 200
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to delete habit', 'details': str(e)}), 500

@habits_bp.route('/<habit_id>/progress', methods=['GET'])
@jwt_required()
def get_habit_progress(habit_id):
    """
    Get progress data for a specific habit
    Returns analytics and progress information for habit tracking
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Find habit and ensure it belongs to the current user
        habit = Habit.query.filter_by(id=habit_id, user_id=current_user_id).first()
        
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404
        
        # Get days parameter from query string (default to 30 days)
        days = request.args.get('days', 30, type=int)
        
        # Get comprehensive progress data from habit model
        progress_data = habit.get_progress_data(days=days)
        
        return jsonify({
            'habit_id': habit_id,
            'progress': progress_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch progress', 'details': str(e)}), 500

@habits_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """
    Get all available habit categories
    Returns list of valid category options for habit creation
    """
    # Convert enum values to user-friendly format
    categories = [{'value': cat.value, 'label': cat.value.replace('_', ' ').title()} 
                  for cat in HabitCategory]
    return jsonify({'categories': categories}), 200

@habits_bp.route('/frequencies', methods=['GET'])
@jwt_required()
def get_frequencies():
    """
    Get all available habit frequencies
    Returns list of valid frequency options for habit creation
    """
    # Convert enum values to user-friendly format
    frequencies = [{'value': freq.value, 'label': freq.value.title()} 
                   for freq in HabitFrequency]
    return jsonify({'frequencies': frequencies}), 200
