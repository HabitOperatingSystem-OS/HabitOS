from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.habit import Habit, HabitCategory, HabitFrequency

# Create blueprint for habit management routes
habits_bp = Blueprint('habits', __name__)

@habits_bp.route('/', methods=['OPTIONS'])
@habits_bp.route('', methods=['OPTIONS'])
def handle_preflight():
    """Handle preflight OPTIONS requests"""
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

@habits_bp.route('/', methods=['GET'])
@habits_bp.route('', methods=['GET'])
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
@habits_bp.route('', methods=['POST'])
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
        
        # Validate occurrence_days for weekly and monthly habits
        occurrence_days = data.get('occurrence_days', [])
        frequency_count = data.get('frequency_count', 0) if data.get('frequency_count') != "" else 0
        
        if frequency in ['weekly', 'monthly']:
            required_count = max(frequency_count, 1)  # At least 1
            if len(occurrence_days) != required_count:
                return jsonify({
                    'error': f'For {frequency} habits, you must select exactly {required_count} day{"s" if required_count > 1 else ""}'
                }), 400
        
        # Create new habit instance with validated data
        habit = Habit(
            user_id=current_user_id,
            title=data['title'],
            category=HabitCategory(category),
            frequency=HabitFrequency(frequency),
            frequency_count=data.get('frequency_count', 0) if data.get('frequency_count') != "" else 0,  # Default to 0
            occurrence_days_list=data.get('occurrence_days', [])  # Default to empty list
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
            habit.frequency_count = data['frequency_count'] if data['frequency_count'] != "" else 0
        
        if 'occurrence_days' in data:
            # Validate occurrence_days count matches frequency_count
            if habit.frequency.value in ['weekly', 'monthly']:
                required_count = max(habit.frequency_count, 1)
                if len(data['occurrence_days']) != required_count:
                    return jsonify({
                        'error': f'For {habit.frequency.value} habits, you must select exactly {required_count} day{"s" if required_count > 1 else ""}'
                    }), 400
            habit.occurrence_days_list = data['occurrence_days']
        
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

@habits_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_habit_stats():
    """
    Get comprehensive statistics for all habits of the current user
    Returns aggregated statistics for dashboard display
    """
    current_user_id = get_jwt_identity()
    
    try:
        from datetime import date, timedelta
        from sqlalchemy import func, and_
        from app.models.check_in import CheckIn
        
        # Get all habits for the user
        habits = Habit.query.filter_by(user_id=current_user_id).all()
        
        if not habits:
            return jsonify({
                'total_habits': 0,
                'active_habits': 0,
                'due_today': 0,
                'best_streak': 0,
                'total_completion_rate': 0,
                'habits_with_streaks': 0,
                'category_breakdown': {}
            }), 200
        
        # Calculate basic stats
        total_habits = len(habits)
        active_habits = len([h for h in habits if h.active])
        
        # Calculate due today (habits that are due AND not completed today)
        today = date.today()
        due_today = 0
        for habit in habits:
            if habit.active and habit.is_due_today():
                # Check if this habit has been completed today
                today_check_in = CheckIn.query.filter(
                    and_(
                        CheckIn.habit_id == habit.id,
                        CheckIn.user_id == current_user_id,
                        CheckIn.date == today,
                        CheckIn.completed == True
                    )
                ).first()
                
                # Only count as due if not completed today
                if not today_check_in:
                    due_today += 1
        
        best_streak = max([h.longest_streak for h in habits]) if habits else 0
        habits_with_streaks = len([h for h in habits if h.current_streak > 0])
        
        # Calculate category breakdown
        category_breakdown = {}
        for habit in habits:
            category = habit.category.value
            if category not in category_breakdown:
                category_breakdown[category] = 0
            category_breakdown[category] += 1
        
        # Calculate overall completion rate (average of all active habits)
        today = date.today()
        start_date = today - timedelta(days=30)
        
        total_completion_rate = 0
        active_habits_count = 0
        
        for habit in habits:
            if habit.active:
                # Get check-ins for this habit in the last 30 days
                check_ins = CheckIn.query.filter(
                    and_(
                        CheckIn.habit_id == habit.id,
                        CheckIn.user_id == current_user_id,
                        CheckIn.date >= start_date,
                        CheckIn.date <= today,
                        CheckIn.completed == True
                    )
                ).count()
                
                # Calculate expected completions based on frequency
                expected = 0
                current_date = start_date
                while current_date <= today:
                    if current_date >= habit.start_date:
                        if habit.frequency.value == 'daily':
                            expected += 1
                        elif habit.frequency.value == 'weekly':
                            if current_date.weekday() == 0:  # Monday
                                expected += max(habit.frequency_count, 1)
                        elif habit.frequency.value == 'monthly':
                            if current_date.day == 1:  # First of month
                                expected += max(habit.frequency_count, 1)
                        elif habit.frequency.value == 'custom':
                            expected += max(habit.frequency_count, 1)
                    current_date += timedelta(days=1)
                
                if expected > 0:
                    completion_rate = min((check_ins / expected) * 100, 100)
                    total_completion_rate += completion_rate
                    active_habits_count += 1
        
        avg_completion_rate = round(total_completion_rate / active_habits_count) if active_habits_count > 0 else 0
        
        return jsonify({
            'total_habits': total_habits,
            'active_habits': active_habits,
            'due_today': due_today,
            'best_streak': best_streak,
            'total_completion_rate': avg_completion_rate,
            'habits_with_streaks': habits_with_streaks,
            'category_breakdown': category_breakdown
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch habit statistics', 'details': str(e)}), 500
