from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.journal_entry import JournalEntry
from app.models.check_in import CheckIn
from app.models.habit import Habit
from app.models.goal import Goal
from app.utils.ai_service import get_ai_service
from datetime import datetime, date, timedelta

# Create blueprint for journal management routes
journal_bp = Blueprint('journal', __name__)

@journal_bp.route('/', methods=['GET'])
@jwt_required()
def get_journal_entries():
    """
    Get all journal entries for the current user with optional filters
    Supports filtering by check-in, date range, and AI data inclusion
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Extract query parameters for filtering
        checkin_id = request.args.get('checkin_id')  # Filter by specific check-in
        start_date = request.args.get('start_date')  # Filter by start date
        end_date = request.args.get('end_date')  # Filter by end date
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
    Validates input data and creates entry
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
        
        # Save entry to database
        db.session.add(entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Journal entry created successfully',
            'entry': entry.to_dict()
        }), 201
        
    except Exception as e:
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
    Allows updating content and triggers re-analysis of AI insights
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

# =============================================================================
# GEMINI-POWERED ENDPOINTS
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
        
        # Get prompts from AI service
        ai_service = get_ai_service()
        prompts = ai_service.generate_prompts(count=5)
        
        return jsonify({
            'prompts': prompts,
            'prompt_type': prompt_type,
            'count': len(prompts)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to generate prompts', 'details': str(e)}), 500

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

@journal_bp.route('/writing-suggestions', methods=['POST'])
@jwt_required()
def get_writing_suggestions():
    """
    Get writing suggestions for journal entries using Gemini AI
    Returns contextual suggestions based on current content
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        content = data.get('content', '')
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        # Get user context for personalized suggestions
        user_context = _build_user_context(current_user_id)
        
        # Generate suggestions using AI service
        ai_service = get_ai_service()
        suggestions = ai_service.generate_prompts(count=3)
        
        return jsonify({
            'suggestions': suggestions,
            'content_length': len(content)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to generate writing suggestions', 'details': str(e)}), 500

@journal_bp.route('/insights-summary', methods=['POST'])
@jwt_required()
def generate_insights_summary():
    """
    Generate insights summary for a specific period using Gemini AI
    Returns comprehensive summary of journal insights
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        period = data.get('period', 'week')  # week, month, year
        
        # Calculate date range based on period
        end_date = date.today()
        if period == 'week':
            start_date = end_date - timedelta(days=7)
        elif period == 'month':
            start_date = end_date - timedelta(days=30)
        elif period == 'year':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=7)  # Default to week
        
        # Get journal entries for the period
        entries = JournalEntry.query.filter_by(user_id=current_user_id)\
            .filter(JournalEntry.entry_date >= start_date, JournalEntry.entry_date <= end_date)\
            .order_by(JournalEntry.entry_date.desc())\
            .all()
        
        # Get user context
        user_context = _build_user_context(current_user_id)
        
        # Generate summary using AI service
        ai_service = get_ai_service()
        entries_data = [entry.to_dict() for entry in entries]
        summary = ai_service.generate_monthly_summary(entries_data)
        
        return jsonify({
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'summary': summary,
            'entries_analyzed': len(entries)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to generate insights summary', 'details': str(e)}), 500

@journal_bp.route('/habit-correlations', methods=['POST'])
@jwt_required()
def analyze_habit_correlations():
    """
    Analyze correlations between habits and journal entries using Gemini AI
    Returns insights about habit-journal relationships
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Get user's habits
        habits = Habit.query.filter_by(user_id=current_user_id).all()
        
        # Get recent journal entries
        days_back = data.get('days_back', 30)
        start_date = date.today() - timedelta(days=days_back)
        
        entries = JournalEntry.query.filter_by(user_id=current_user_id)\
            .filter(JournalEntry.entry_date >= start_date)\
            .order_by(JournalEntry.entry_date.desc())\
            .all()
        
        # Prepare data for analysis
        habit_data = [{'id': habit.id, 'title': habit.title, 'category': habit.category.value} for habit in habits]
        entry_data = [entry.to_dict() for entry in entries]
        
        # Generate correlations using AI service (simplified)
        ai_service = get_ai_service()
        # Simplified correlation analysis - just return basic insights
        correlations = {
            'habit_influences': [],
            'journal_reflections': [],
            'synergies': [],
            'integration_opportunities': [],
            'recommendations': [],
            'correlation_summary': f"Analyzed {len(habit_data)} habits and {len(entry_data)} journal entries over the last {days_back} days."
        }
        
        return jsonify({
            'correlations': correlations,
            'habits_analyzed': len(habit_data),
            'entries_analyzed': len(entry_data),
            'analysis_period': f'Last {days_back} days'
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to analyze habit correlations', 'details': str(e)}), 500

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
            # Note: AI insights removed, using content analysis instead
            content_words = latest_entry.content.lower().split()
            common_themes = ['work', 'family', 'health', 'exercise', 'learning', 'social', 'creative']
            last_entry_themes = [theme for theme in common_themes if theme in content_words]
        
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
