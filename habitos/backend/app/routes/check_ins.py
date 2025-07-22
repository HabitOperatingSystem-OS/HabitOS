from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.check_in import CheckIn
from app.models.habit import Habit
from app.models.journal_entry import JournalEntry, SentimentType
from datetime import datetime, date
import openai

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
        db.session.flush()  # Get check_in.id before commit

        # If a reflection is provided, create a linked journal entry
        reflection = data.get('reflection')
        if reflection:
            journal_entry = JournalEntry(
                user_id=current_user_id,
                checkin_id=check_in.id,
                content=reflection,
                entry_date=check_in_date
            )
            journal_entry.analyze_sentiment()
            journal_entry.generate_ai_insights()
            db.session.add(journal_entry)

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

@check_ins_bp.route('/bulk', methods=['POST'])
@jwt_required()
def create_bulk_check_in():
    """
    Create check-ins for multiple habits at once
    Allows users to log check-ins for all habits with mood rating and optional journal
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Add detailed logging for debugging
    print(f"Bulk check-in request from user {current_user_id}")
    print(f"Request data: {data}")
    
    # Validate required fields
    if not data:
        return jsonify({'error': 'Request body is required'}), 400
    
    if not data.get('date'):
        return jsonify({'error': 'Date is required'}), 400
    
    if not data.get('habits'):
        return jsonify({'error': 'Habits data is required'}), 400
    
    if not isinstance(data['habits'], list):
        return jsonify({'error': 'Habits must be an array'}), 400
    
    try:
        # Parse and validate the check-in date
        try:
            check_in_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Get all user's habits
        user_habits = Habit.query.filter_by(user_id=current_user_id).all()
        habit_ids = [habit.id for habit in user_habits]
        
        print(f"User has {len(habit_ids)} habits: {habit_ids}")
        
        # Validate that all provided habit IDs belong to the user
        provided_habit_ids = [h.get('habit_id') for h in data['habits'] if h.get('habit_id')]
        print(f"Provided habit IDs: {provided_habit_ids}")
        
        invalid_habit_ids = [hid for hid in provided_habit_ids if hid not in habit_ids]
        if invalid_habit_ids:
            return jsonify({'error': f'Invalid habit IDs: {invalid_habit_ids}'}), 400
        
        # Check for existing check-ins for today
        existing_check_ins = CheckIn.query.filter_by(
            user_id=current_user_id,
            date=check_in_date
        ).all()
        
        print(f"Found {len(existing_check_ins)} existing check-ins for {check_in_date}")
        
        # Create a map of existing check-ins by habit_id
        existing_check_in_map = {ci.habit_id: ci for ci in existing_check_ins}
        
        created_check_ins = []
        updated_check_ins = []
        
        # Process each habit check-in
        for habit_data in data['habits']:
            habit_id = habit_data.get('habit_id')
            completed = habit_data.get('completed', False)
            actual_value = habit_data.get('actual_value')
            
            print(f"Processing habit {habit_id}: completed={completed}, actual_value={actual_value}")
            
            # Check if check-in already exists for this habit and date
            existing_check_in = existing_check_in_map.get(habit_id)
            
            if existing_check_in:
                # Update existing check-in
                existing_check_in.completed = completed
                existing_check_in.actual_value = actual_value
                existing_check_in.mood_rating = data.get('mood_rating')
                updated_check_ins.append(existing_check_in)
                print(f"Updated existing check-in for habit {habit_id}")
            else:
                # Create new check-in
                check_in = CheckIn(
                    habit_id=habit_id,
                    user_id=current_user_id,
                    date=check_in_date,
                    completed=completed,
                    actual_value=actual_value,
                    mood_rating=data.get('mood_rating')
                )
                db.session.add(check_in)
                created_check_ins.append(check_in)
                print(f"Created new check-in for habit {habit_id}")
        
        # Flush to get check-in IDs before creating journal entry
        db.session.flush()
        
        # Create journal entry if content is provided
        journal_entry = None
        if data.get('journal_content'):
            # Link journal entry to the first check-in created/updated today
            first_checkin = None
            if created_check_ins:
                first_checkin = created_check_ins[0]
            elif updated_check_ins:
                first_checkin = updated_check_ins[0]
            
            journal_entry = JournalEntry(
                user_id=current_user_id,
                checkin_id=first_checkin.id if first_checkin else None,
                content=data['journal_content'],
                entry_date=check_in_date
            )
            
            # Analyze sentiment if OpenAI is configured
            if hasattr(db, 'app') and db.app.config.get('OPENAI_API_KEY'):
                try:
                    client = openai.OpenAI(api_key=db.app.config['OPENAI_API_KEY'])
                    response = client.chat.completions.create(
                        model=db.app.config.get('OPENAI_MODEL', 'gpt-3.5-turbo'),
                        messages=[
                            {
                                "role": "system",
                                "content": "Analyze the sentiment of the following journal entry. Respond with only one word: 'positive', 'negative', or 'neutral'."
                            },
                            {
                                "role": "user",
                                "content": data['journal_content']
                            }
                        ],
                        max_tokens=10
                    )
                    sentiment = response.choices[0].message.content.strip().lower()
                    
                    # Map sentiment to enum values
                    sentiment_map = {
                        'positive': SentimentType.POSITIVE,
                        'negative': SentimentType.NEGATIVE,
                        'neutral': SentimentType.NEUTRAL
                    }
                    
                    if sentiment in sentiment_map:
                        journal_entry.sentiment = sentiment_map[sentiment]
                        journal_entry.sentiment_score = 0.7 if sentiment == 'positive' else (-0.5 if sentiment == 'negative' else 0.0)
                    
                except Exception as e:
                    # Log error but don't fail the request
                    print(f"OpenAI sentiment analysis failed: {e}")
            
            db.session.add(journal_entry)
            print("Created journal entry")
        
        # Commit all changes
        print("Committing database changes...")
        db.session.commit()
        print("Database changes committed successfully")
        
        # Update habit streaks for completed check-ins
        for check_in in created_check_ins + updated_check_ins:
            if check_in.completed:
                check_in.habit.update_streak()
        
        db.session.commit()
        print("Habit streaks updated")
        
        response_data = {
            'message': 'Bulk check-in created successfully',
            'created_count': len(created_check_ins),
            'updated_count': len(updated_check_ins),
            'journal_created': journal_entry is not None,
            'sentiment': journal_entry.sentiment.value if journal_entry and journal_entry.sentiment else None
        }
        
        print(f"Returning response: {response_data}")
        return jsonify(response_data), 201
        
    except Exception as e:
        # Rollback database changes on error
        print(f"Error in bulk check-in: {str(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': 'Failed to create bulk check-in', 'details': str(e)}), 500
