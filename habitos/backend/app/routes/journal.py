from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.journal_entry import JournalEntry, SentimentType
from app.models.check_in import CheckIn
from datetime import datetime, date

# Create blueprint for journal management routes
journal_bp = Blueprint('journal', __name__)

@journal_bp.route('/', methods=['GET'])
@jwt_required()
def get_journal_entries():
    """
    Get all journal entries for the current user with optional filters
    Supports filtering by check-in, date range, sentiment, and AI data inclusion
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Extract query parameters for filtering
        checkin_id = request.args.get('checkin_id')  # Filter by specific check-in
        start_date = request.args.get('start_date')  # Filter by start date
        end_date = request.args.get('end_date')  # Filter by end date
        sentiment = request.args.get('sentiment')  # Filter by sentiment type
        include_ai_data = request.args.get('include_ai_data', 'false').lower() == 'true'  # Include AI analysis
        
        # Start building the query for current user's journal entries
        query = JournalEntry.query.filter_by(user_id=current_user_id)
        
        # Apply check-in filter if provided
        if checkin_id:
            query = query.filter_by(checkin_id=checkin_id)
        
        # Apply date range filters if provided
        if start_date:
            try:
                # Parse start date string to date object
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(JournalEntry.entry_date >= start_date_obj)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        if end_date:
            try:
                # Parse end date string to date object
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(JournalEntry.entry_date <= end_date_obj)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        # Apply sentiment filter if provided
        if sentiment:
            # Validate sentiment enum value
            if sentiment not in [s.value for s in SentimentType]:
                return jsonify({'error': 'Invalid sentiment'}), 400
            query = query.filter_by(sentiment=SentimentType(sentiment))
        
        # Execute query with ordering (most recent first)
        entries = query.order_by(JournalEntry.entry_date.desc()).all()
        
        return jsonify({
            'journal_entries': [entry.to_dict(include_ai_data=include_ai_data) for entry in entries],
            'count': len(entries)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch journal entries', 'details': str(e)}), 500

@journal_bp.route('/', methods=['POST'])
@jwt_required()
def create_journal_entry():
    """
    Create a new journal entry
    Validates input data, creates entry, and performs AI analysis
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if not data.get('content'):
        return jsonify({'error': 'Content is required'}), 400
    
    try:
        # Validate check-in exists and belongs to user if provided
        checkin_id = data.get('checkin_id')
        if not checkin_id:
            return jsonify({'error': 'checkin_id is required'}), 400

        check_in = CheckIn.query.filter_by(id=checkin_id, user_id=current_user_id).first()
        if not check_in:
            return jsonify({'error': 'Check-in not found'}), 404
        
        # Parse entry date if provided (default to today)
        entry_date = date.today()
        if data.get('entry_date'):
            try:
                entry_date = datetime.strptime(data['entry_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid entry_date format. Use YYYY-MM-DD'}), 400
        
        # Create new journal entry with provided data
        entry = JournalEntry(
            user_id=current_user_id,
            checkin_id=checkin_id,
            content=data['content'],
            entry_date=entry_date
        )
        
        # Perform AI analysis if content is provided
        if data['content']:
            entry.analyze_sentiment()  # Analyze sentiment from content
            entry.generate_ai_insights()  # Generate AI insights and summary
        
        # Save entry to database
        db.session.add(entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Journal entry created successfully',
            'journal_entry': entry.to_dict(include_ai_data=True)
        }), 201
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to create journal entry', 'details': str(e)}), 500

@journal_bp.route('/<entry_id>', methods=['GET'])
@jwt_required()
def get_journal_entry(entry_id):
    """
    Get a specific journal entry by ID
    Returns detailed information about a single journal entry
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Find journal entry and ensure it belongs to the current user
        entry = JournalEntry.query.filter_by(id=entry_id, user_id=current_user_id).first()
        
        if not entry:
            return jsonify({'error': 'Journal entry not found'}), 404
        
        # Check if AI data should be included
        include_ai_data = request.args.get('include_ai_data', 'false').lower() == 'true'
        
        return jsonify({'journal_entry': entry.to_dict(include_ai_data=include_ai_data)}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch journal entry', 'details': str(e)}), 500

@journal_bp.route('/<entry_id>', methods=['PUT'])
@jwt_required()
def update_journal_entry(entry_id):
    """
    Update a specific journal entry
    Allows updating content and triggers re-analysis of sentiment and AI insights
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Find journal entry and ensure it belongs to the current user
        entry = JournalEntry.query.filter_by(id=entry_id, user_id=current_user_id).first()
        
        if not entry:
            return jsonify({'error': 'Journal entry not found'}), 404
        
        # Update fields if provided in request data
        if 'content' in data:
            entry.content = data['content']
            # Re-analyze sentiment and generate insights for updated content
            entry.analyze_sentiment()
            entry.generate_ai_insights()
        
        if 'entry_date' in data:
            try:
                # Parse entry date string to date object
                entry.entry_date = datetime.strptime(data['entry_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid entry_date format. Use YYYY-MM-DD'}), 400
        
        # Save changes to database
        db.session.commit()
        
        return jsonify({
            'message': 'Journal entry updated successfully',
            'journal_entry': entry.to_dict(include_ai_data=True)
        }), 200
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to update journal entry', 'details': str(e)}), 500

@journal_bp.route('/<entry_id>', methods=['DELETE'])
@jwt_required()
def delete_journal_entry(entry_id):
    """
    Delete a specific journal entry
    Removes journal entry from the database
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Find journal entry and ensure it belongs to the current user
        entry = JournalEntry.query.filter_by(id=entry_id, user_id=current_user_id).first()
        
        if not entry:
            return jsonify({'error': 'Journal entry not found'}), 404
        
        # Delete journal entry from database
        db.session.delete(entry)
        db.session.commit()
        
        return jsonify({'message': 'Journal entry deleted successfully'}), 200
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to delete journal entry', 'details': str(e)}), 500

@journal_bp.route('/checkin/<checkin_id>', methods=['GET'])
@jwt_required()
def get_checkin_journal_entries(checkin_id):
    """
    Get all journal entries for a specific check-in
    Returns all journal entries associated with a particular check-in
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Verify that the check-in exists and belongs to the current user
        check_in = CheckIn.query.filter_by(id=checkin_id, user_id=current_user_id).first()
        if not check_in:
            return jsonify({'error': 'Check-in not found'}), 404
        
        # Query all journal entries for this check-in
        entries = JournalEntry.query.filter_by(checkin_id=checkin_id, user_id=current_user_id).all()
        
        return jsonify({
            'checkin_id': checkin_id,
            'journal_entries': [entry.to_dict() for entry in entries],
            'count': len(entries)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch check-in journal entries', 'details': str(e)}), 500

@journal_bp.route('/today', methods=['GET'])
@jwt_required()
def get_today_entries():
    """
    Get all journal entries for today
    Returns all journal entries for the current user for today's date
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    today = date.today()  # Get current date
    
    try:
        # Query all journal entries for today
        entries = JournalEntry.query.filter_by(
            user_id=current_user_id,
            entry_date=today
        ).all()
        
        return jsonify({
            'date': today.isoformat(),
            'journal_entries': [entry.to_dict() for entry in entries],
            'count': len(entries)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch today\'s journal entries', 'details': str(e)}), 500

@journal_bp.route('/sentiment-analysis', methods=['POST'])
@jwt_required()
def analyze_sentiment():
    """
    Analyze sentiment for provided text
    Performs AI-powered sentiment analysis without creating a journal entry
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required content
    if not data.get('content'):
        return jsonify({'error': 'Content is required'}), 400
    
    try:
        # Create temporary journal entry for analysis (not saved to database)
        temp_entry = JournalEntry(
            user_id=current_user_id,
            content=data['content']
        )
        
        # Perform AI analysis on the content
        temp_entry.analyze_sentiment()  # Analyze sentiment
        temp_entry.generate_ai_insights()  # Generate insights and summary
        
        return jsonify({
            'sentiment': temp_entry.sentiment.value if temp_entry.sentiment else None,
            'sentiment_score': temp_entry.sentiment_score,
            'ai_insights': temp_entry.ai_insights,
            'ai_summary': temp_entry.ai_summary
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to analyze sentiment', 'details': str(e)}), 500

@journal_bp.route('/sentiments', methods=['GET'])
@jwt_required()
def get_sentiments():
    """
    Get all available sentiment types
    Returns list of valid sentiment options for filtering
    """
    # Convert enum values to user-friendly format
    sentiments = [{'value': s.value, 'label': s.value.replace('_', ' ').title()} 
                  for s in SentimentType]
    return jsonify({'sentiments': sentiments}), 200
