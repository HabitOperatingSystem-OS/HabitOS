from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.journal_entry import JournalEntry, SentimentType
from app.models.check_in import CheckIn
from app.models.habit import Habit
from app.models.goal import Goal
from app.utils.gemini_service import get_gemini_service
from datetime import datetime, date, timedelta

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

# =============================================================================
# NEW GEMINI-POWERED ENDPOINTS
# =============================================================================

@journal_bp.route('/prompts', methods=['GET'])
@jwt_required()
def get_journal_prompts():
    """
    Get personalized journaling prompts using Gemini AI
    Returns contextual prompts based on user's habits, goals, and recent entries
    """
    current_user_id = get_jwt_identity()
    
    try:
        # Get query parameters
        prompt_type = request.args.get('type', 'general')  # general, habit-focused, goal-oriented, etc.
        
        # Build user context for personalized prompts
        user_context = _build_user_context(current_user_id)
        
        # Get prompts from Gemini service
        gemini_service = get_gemini_service()
        prompts = gemini_service.generate_reflective_prompts(user_context, prompt_type)
        
        return jsonify({
            'prompts': prompts,
            'prompt_type': prompt_type,
            'count': len(prompts)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to generate prompts', 'details': str(e)}), 500

@journal_bp.route('/insights/<entry_id>', methods=['GET'])
@jwt_required()
def get_entry_insights(entry_id):
    """
    Get detailed AI insights for a specific journal entry
    Returns comprehensive analysis using Gemini AI
    """
    current_user_id = get_jwt_identity()
    
    try:
        # Find journal entry and ensure it belongs to the current user
        entry = JournalEntry.query.filter_by(id=entry_id, user_id=current_user_id).first()
        
        if not entry:
            return jsonify({'error': 'Journal entry not found'}), 404
        
        # Get user context for personalized insights
        user_context = _build_user_context(current_user_id)
        
        # Generate fresh insights using Gemini
        gemini_service = get_gemini_service()
        insights = gemini_service.generate_journal_insights(entry.content, user_context)
        
        return jsonify({
            'entry_id': entry_id,
            'insights': insights
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to generate insights', 'details': str(e)}), 500

@journal_bp.route('/patterns', methods=['GET'])
@jwt_required()
def analyze_journal_patterns():
    """
    Analyze patterns across user's journal entries using Gemini AI
    Returns insights about recurring themes, emotional patterns, and growth indicators
    """
    current_user_id = get_jwt_identity()
    
    try:
        # Get query parameters
        days_back = int(request.args.get('days_back', 30))  # Analyze last N days
        limit = int(request.args.get('limit', 20))  # Maximum entries to analyze
        
        # Get recent journal entries
        start_date = date.today() - timedelta(days=days_back)
        entries = JournalEntry.query.filter_by(user_id=current_user_id)\
            .filter(JournalEntry.entry_date >= start_date)\
            .order_by(JournalEntry.entry_date.desc())\
            .limit(limit)\
            .all()
        
        # Convert to dict format for analysis
        entries_data = [entry.to_dict() for entry in entries]
        
        # Analyze patterns using Gemini
        gemini_service = get_gemini_service()
        patterns = gemini_service.analyze_journal_patterns(entries_data)
        
        return jsonify({
            'patterns': patterns,
            'analysis_period': f'Last {days_back} days',
            'entries_analyzed': len(entries_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to analyze patterns', 'details': str(e)}), 500

@journal_bp.route('/insights/batch', methods=['POST'])
@jwt_required()
def batch_analyze_insights():
    """
    Analyze multiple journal entries for insights
    Useful for bulk analysis or when entries don't have AI data
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        entry_ids = data.get('entry_ids', [])
        if not entry_ids:
            return jsonify({'error': 'entry_ids array is required'}), 400
        
        # Get user context
        user_context = _build_user_context(current_user_id)
        
        # Get entries and analyze them
        entries = JournalEntry.query.filter_by(user_id=current_user_id)\
            .filter(JournalEntry.id.in_(entry_ids))\
            .all()
        
        results = []
        gemini_service = get_gemini_service()
        for entry in entries:
            insights = gemini_service.generate_journal_insights(entry.content, user_context)
            results.append({
                'entry_id': entry.id,
                'entry_date': entry.entry_date.isoformat(),
                'insights': insights
            })
        
        return jsonify({
            'results': results,
            'count': len(results)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to batch analyze insights', 'details': str(e)}), 500

@journal_bp.route('/prompts/categories', methods=['GET'])
@jwt_required()
def get_prompt_categories():
    """
    Get available prompt categories
    Returns list of prompt types that can be requested
    """
    categories = [
        {'value': 'general', 'label': 'General Reflection', 'description': 'Daily experiences and thoughts'},
        {'value': 'habit-focused', 'label': 'Habit Tracking', 'description': 'Habit consistency and progress'},
        {'value': 'goal-oriented', 'label': 'Goal Progress', 'description': 'Goal achievement and milestones'},
        {'value': 'emotional', 'label': 'Emotional Awareness', 'description': 'Emotional processing and awareness'},
        {'value': 'gratitude', 'label': 'Gratitude Practice', 'description': 'Gratitude and positive reflection'},
        {'value': 'challenge', 'label': 'Overcoming Challenges', 'description': 'Difficulties and growth'},
        {'value': 'wellness', 'label': 'Wellness & Self-Care', 'description': 'Physical and mental wellness'}
    ]
    
    return jsonify({'categories': categories}), 200

def _build_user_context(user_id):
    """
    Build user context for AI personalization
    Includes habits, goals, recent mood trends, and entry themes
    """
    try:
        # Get user's habits
        habits = Habit.query.filter_by(user_id=user_id).all()
        habit_titles = [habit.title for habit in habits]
        
        # Get user's active goals
        goals = Goal.query.filter_by(user_id=user_id, status='in_progress').all()
        goal_titles = [goal.title for goal in goals]
        
        # Get recent mood trends from check-ins
        recent_checkins = CheckIn.query.filter_by(user_id=user_id)\
            .order_by(CheckIn.date.desc())\
            .limit(7)\
            .all()
        mood_trends = [checkin.mood_rating for checkin in recent_checkins if checkin.mood_rating]
        
        # Get recent journal entry themes
        recent_entries = JournalEntry.query.filter_by(user_id=user_id)\
            .order_by(JournalEntry.entry_date.desc())\
            .limit(5)\
            .all()
        
        last_entry_themes = []
        if recent_entries:
            # Extract themes from the most recent entry
            latest_entry = recent_entries[0]
            if latest_entry.ai_insights:
                try:
                    import json
                    insights = json.loads(latest_entry.ai_insights)
                    last_entry_themes = insights.get('key_themes', [])
                except:
                    pass
        
        # Determine time of day
        current_hour = datetime.now().hour
        if 5 <= current_hour < 12:
            time_of_day = 'morning'
        elif 12 <= current_hour < 17:
            time_of_day = 'afternoon'
        elif 17 <= current_hour < 21:
            time_of_day = 'evening'
        else:
            time_of_day = 'night'
        
        return {
            'habits': habit_titles,
            'goals': goal_titles,
            'mood_trends': mood_trends,
            'last_entry_themes': last_entry_themes,
            'time_of_day': time_of_day
        }
        
    except Exception as e:
        return {}
