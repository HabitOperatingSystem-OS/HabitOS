from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.check_in import CheckIn
from app.models.habit import Habit
from datetime import datetime, date

# Create blueprint for check-in management routes
check_ins_bp = Blueprint('check_ins', __name__)

@check_ins_bp.route('/', methods=['GET'])
@jwt_required()
def get_check_ins():
    """
    Get all check-ins for the current user with optional filters
    Supports filtering by habit, date range, and completion status
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Extract query parameters for filtering
        habit_id = request.args.get('habit_id')  # Filter by specific habit
        start_date = request.args.get('start_date')  # Filter by start date
        end_date = request.args.get('end_date')  # Filter by end date
        completed = request.args.get('completed')  # Filter by completion status
        
        # Start building the query for current user's check-ins
        query = CheckIn.query.filter_by(user_id=current_user_id)
        
        # Apply habit filter if provided
        if habit_id:
            query = query.filter_by(habit_id=habit_id)
        
        # Apply date range filters if provided
        if start_date:
            try:
                # Parse start date string to date object
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(CheckIn.date >= start_date_obj)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        if end_date:
            try:
                # Parse end date string to date object
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(CheckIn.date <= end_date_obj)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        # Apply completion status filter if provided
        if completed is not None:
            # Convert string to boolean
            completed_bool = completed.lower() == 'true'
            query = query.filter_by(completed=completed_bool)
        
        # Order results by date (most recent first) and execute query
        check_ins = query.order_by(CheckIn.date.desc()).all()
        
        return jsonify({
            'check_ins': [check_in.to_dict() for check_in in check_ins],
            'count': len(check_ins)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch check-ins', 'details': str(e)}), 500

@check_ins_bp.route('/', methods=['POST'])
@jwt_required()
def create_check_in():
    """
    Create a new check-in
    Validates input data and creates a check-in for a specific habit and date
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if not data.get('habit_id'):
        return jsonify({'error': 'Habit ID is required'}), 400
    
    if not data.get('date'):
        return jsonify({'error': 'Date is required'}), 400
    
    try:
        # Verify that the habit exists and belongs to the current user
        habit = Habit.query.filter_by(id=data['habit_id'], user_id=current_user_id).first()
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404
        
        # Parse and validate the check-in date
        try:
            check_in_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Check for duplicate check-ins (one per habit per day)
        existing_check_in = CheckIn.query.filter_by(
            habit_id=data['habit_id'],
            user_id=current_user_id,
            date=check_in_date
        ).first()
        
        if existing_check_in:
            return jsonify({'error': 'Check-in already exists for this date'}), 409
        
        # Create new check-in with provided data
        check_in = CheckIn(
            habit_id=data['habit_id'],
            user_id=current_user_id,
            date=check_in_date,
            completed=data.get('completed', False),  # Default to not completed
            actual_value=data.get('actual_value'),  # Optional progress value
            mood_rating=data.get('mood_rating')  # Optional mood rating
        )
        
        # Save check-in to database
        db.session.add(check_in)
        db.session.commit()
        
        # Update habit streak if check-in is completed
        if check_in.completed:
            habit.update_streak()
            db.session.commit()
        
        return jsonify({
            'message': 'Check-in created successfully',
            'check_in': check_in.to_dict()
        }), 201
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to create check-in', 'details': str(e)}), 500

@check_ins_bp.route('/<check_in_id>', methods=['GET'])
@jwt_required()
def get_check_in(check_in_id):
    """
    Get a specific check-in by ID
    Returns detailed information about a single check-in
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Find check-in and ensure it belongs to the current user
        check_in = CheckIn.query.filter_by(id=check_in_id, user_id=current_user_id).first()
        
        if not check_in:
            return jsonify({'error': 'Check-in not found'}), 404
        
        return jsonify({'check_in': check_in.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch check-in', 'details': str(e)}), 500

@check_ins_bp.route('/<check_in_id>', methods=['PUT'])
@jwt_required()
def update_check_in(check_in_id):
    """
    Update a specific check-in
    Allows updating check-in properties and triggers streak recalculation
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Find check-in and ensure it belongs to the current user
        check_in = CheckIn.query.filter_by(id=check_in_id, user_id=current_user_id).first()
        
        if not check_in:
            return jsonify({'error': 'Check-in not found'}), 404
        
        # Track if completion status changed for streak update
        completion_changed = 'completed' in data and data['completed'] != check_in.completed
        
        # Update fields if provided in request data
        if 'completed' in data:
            check_in.completed = data['completed']
        
        if 'actual_value' in data:
            check_in.actual_value = data['actual_value']
        
        if 'mood_rating' in data:
            check_in.mood_rating = data['mood_rating']
        
        # Save changes to database
        db.session.commit()
        
        # Update habit streak if completion status changed
        if completion_changed:
            check_in.habit.update_streak()
            db.session.commit()
        
        return jsonify({
            'message': 'Check-in updated successfully',
            'check_in': check_in.to_dict()
        }), 200
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to update check-in', 'details': str(e)}), 500

@check_ins_bp.route('/<check_in_id>', methods=['DELETE'])
@jwt_required()
def delete_check_in(check_in_id):
    """
    Delete a specific check-in
    Removes check-in and recalculates habit streak
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Find check-in and ensure it belongs to the current user
        check_in = CheckIn.query.filter_by(id=check_in_id, user_id=current_user_id).first()
        
        if not check_in:
            return jsonify({'error': 'Check-in not found'}), 404
        
        # Store reference to habit for streak recalculation
        habit = check_in.habit
        
        # Delete the check-in
        db.session.delete(check_in)
        db.session.commit()
        
        # Recalculate habit streak after deletion
        habit.update_streak()
        db.session.commit()
        
        return jsonify({'message': 'Check-in deleted successfully'}), 200
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to delete check-in', 'details': str(e)}), 500

@check_ins_bp.route('/habit/<habit_id>', methods=['GET'])
@jwt_required()
def get_habit_check_ins(habit_id):
    """
    Get all check-ins for a specific habit
    Returns check-ins filtered by habit with optional date range and limit
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Verify that the habit exists and belongs to the current user
        habit = Habit.query.filter_by(id=habit_id, user_id=current_user_id).first()
        if not habit:
            return jsonify({'error': 'Habit not found'}), 404
        
        # Extract query parameters for filtering
        start_date = request.args.get('start_date')  # Filter by start date
        end_date = request.args.get('end_date')  # Filter by end date
        limit = request.args.get('limit', 30, type=int)  # Limit number of results
        
        # Start building the query for this habit's check-ins
        query = CheckIn.query.filter_by(habit_id=habit_id, user_id=current_user_id)
        
        # Apply date range filters if provided
        if start_date:
            try:
                # Parse start date string to date object
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(CheckIn.date >= start_date_obj)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        if end_date:
            try:
                # Parse end date string to date object
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(CheckIn.date <= end_date_obj)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        # Execute query with ordering and limit
        check_ins = query.order_by(CheckIn.date.desc()).limit(limit).all()
        
        return jsonify({
            'habit_id': habit_id,
            'check_ins': [check_in.to_dict() for check_in in check_ins],
            'count': len(check_ins)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch habit check-ins', 'details': str(e)}), 500

@check_ins_bp.route('/today', methods=['GET'])
@jwt_required()
def get_today_check_ins():
    """
    Get all check-ins for today
    Returns all check-ins for the current user for today's date
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    today = date.today()  # Get current date
    
    try:
        # Query all check-ins for today
        check_ins = CheckIn.query.filter_by(
            user_id=current_user_id,
            date=today
        ).all()
        
        return jsonify({
            'date': today.isoformat(),
            'check_ins': [check_in.to_dict() for check_in in check_ins],
            'count': len(check_ins)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch today\'s check-ins', 'details': str(e)}), 500
