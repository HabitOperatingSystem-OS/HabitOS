from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.habit import Habit
from app.models.check_in import CheckIn
from app.models.goal import Goal, GoalStatus
from app.models.journal_entry import JournalEntry
from datetime import datetime, date, timedelta

# Create blueprint for user management routes
users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """
    Get current user's profile information
    Returns detailed user profile data for the authenticated user
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Find user in database
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch user profile', 'details': str(e)}), 500

@users_bp.route('/profile', methods=['PUT', 'PATCH'])
@jwt_required()
def update_user_profile():
    """
    Update current user's profile information
    Allows updating user profile fields while maintaining data integrity
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Find user in database
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update fields if provided in request data
        if 'username' in data:
            user.username = data['username']
        
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != current_user_id:
                return jsonify({'error': 'Email already exists'}), 409
            user.email = data['email']
        
        if 'bio' in data:
            user.bio = data['bio']
        
        if 'profile_picture_url' in data:
            user.profile_picture_url = data['profile_picture_url']
        
        # Save changes to database
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500

@users_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """
    Get comprehensive user statistics and analytics
    Returns aggregated data about user's habits, check-ins, goals, and journal entries
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Get date range parameter (default to 30 days)
        days = request.args.get('days', 30, type=int)
        start_date = date.today() - timedelta(days=days)
        
        # Calculate various statistics
        total_habits = Habit.query.filter_by(user_id=current_user_id).count()
        active_habits = Habit.query.filter_by(user_id=current_user_id, active=True).count()
        
        # Get check-in statistics for the date range
        check_ins = CheckIn.query.filter(
            CheckIn.user_id == current_user_id,
            CheckIn.date >= start_date
        ).all()
        
        total_check_ins = len(check_ins)
        completed_check_ins = len([ci for ci in check_ins if ci.completed])
        completion_rate = (completed_check_ins / total_check_ins * 100) if total_check_ins > 0 else 0
        
        # Get goal statistics
        total_goals = Goal.query.filter_by(user_id=current_user_id).count()
        active_goals = Goal.query.filter_by(user_id=current_user_id, status=GoalStatus.IN_PROGRESS.value).count()
        completed_goals = Goal.query.filter_by(user_id=current_user_id, status=GoalStatus.COMPLETED.value).count()
        
        # Get journal entry statistics
        journal_entries = JournalEntry.query.filter(
            JournalEntry.user_id == current_user_id,
            JournalEntry.entry_date >= start_date
        ).count()
        
        # Calculate average mood rating
        mood_ratings = [ci.mood_rating for ci in check_ins if ci.mood_rating is not None]
        avg_mood = sum(mood_ratings) / len(mood_ratings) if mood_ratings else None
        
        # Get longest streak
        habits = Habit.query.filter_by(user_id=current_user_id).all()
        max_streak = max([habit.current_streak for habit in habits]) if habits else 0
        
        stats = {
            'period_days': days,
            'habits': {
                'total': total_habits,
                'active': active_habits
            },
            'check_ins': {
                'total': total_check_ins,
                'completed': completed_check_ins,
                'completion_rate': round(completion_rate, 2)
            },
            'goals': {
                'total': total_goals,
                'active': active_goals,
                'completed': completed_goals
            },
            'journal_entries': journal_entries,
            'average_mood': round(avg_mood, 2) if avg_mood else None,
            'longest_streak': max_streak
        }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch user stats', 'details': str(e)}), 500

@users_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    """
    Get dashboard data for the current user
    Returns comprehensive data needed for the user dashboard
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Get today's date
        today = date.today()
        
        # Get user's active habits
        active_habits = Habit.query.filter_by(user_id=current_user_id, active=True).all()
        
        # Get today's check-ins
        today_check_ins = CheckIn.query.filter_by(
            user_id=current_user_id,
            date=today
        ).all()
        
        # Get active goals
        active_goals = Goal.query.filter_by(user_id=current_user_id, status=GoalStatus.IN_PROGRESS.value).all()
        
        # Get recent journal entries (last 5)
        recent_journal_entries = JournalEntry.query.filter_by(
            user_id=current_user_id
        ).order_by(JournalEntry.entry_date.desc()).limit(5).all()
        
        # Get overdue goals
        overdue_goals = Goal.query.filter(
            Goal.user_id == current_user_id,
            Goal.status == GoalStatus.IN_PROGRESS.value,
            Goal.due_date < today
        ).all()
        
        dashboard_data = {
            'active_habits': [habit.to_dict() for habit in active_habits],
            'today_check_ins': [check_in.to_dict() for check_in in today_check_ins],
            'active_goals': [goal.to_dict() for goal in active_goals],
            'recent_journal_entries': [entry.to_dict() for entry in recent_journal_entries],
            'overdue_goals': [goal.to_dict() for goal in overdue_goals],
            'today_date': today.isoformat()
        }
        
        return jsonify({'dashboard': dashboard_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch dashboard data', 'details': str(e)}), 500

@users_bp.route('/habits/summary', methods=['GET'])
@jwt_required()
def get_habits_summary():
    """
    Get summary of user's habits with progress data
    Returns habit summary with completion rates and streaks
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Get date range parameter (default to 7 days)
        days = request.args.get('days', 7, type=int)
        start_date = date.today() - timedelta(days=days)
        
        # Get all user's habits
        habits = Habit.query.filter_by(user_id=current_user_id).all()
        
        habits_summary = []
        for habit in habits:
            # Get check-ins for this habit in the date range
            check_ins = CheckIn.query.filter(
                CheckIn.habit_id == habit.id,
                CheckIn.date >= start_date
            ).all()
            
            total_days = len(check_ins)
            completed_days = len([ci for ci in check_ins if ci.completed])
            completion_rate = (completed_days / total_days * 100) if total_days > 0 else 0
            
            habits_summary.append({
                'habit': habit.to_dict(),
                'completion_rate': round(completion_rate, 2),
                'completed_days': completed_days,
                'total_days': total_days
            })
        
        return jsonify({
            'habits_summary': habits_summary,
            'period_days': days
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch habits summary', 'details': str(e)}), 500

@users_bp.route('/goals/summary', methods=['GET'])
@jwt_required()
def get_goals_summary():
    """
    Get summary of user's goals with progress data
    Returns goal summary with completion status and progress
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Get all user's goals
        goals = Goal.query.filter_by(user_id=current_user_id).all()
        
        goals_summary = []
        for goal in goals:
            # Calculate progress percentage
            progress_percentage = 0
            if goal.target_value > 0:
                progress_percentage = (goal.current_value / goal.target_value) * 100
            
            goals_summary.append({
                'goal': goal.to_dict(),
                'progress_percentage': round(progress_percentage, 2)
            })
        
        return jsonify({'goals_summary': goals_summary}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch goals summary', 'details': str(e)}), 500

@users_bp.route('/journal/summary', methods=['GET'])
@jwt_required()
def get_journal_summary():
    """
    Get summary of user's journal entries with sentiment analysis
    Returns journal summary with sentiment distribution
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Get date range parameter (default to 30 days)
        days = request.args.get('days', 30, type=int)
        start_date = date.today() - timedelta(days=days)
        
        # Get journal entries in the date range
        entries = JournalEntry.query.filter(
            JournalEntry.user_id == current_user_id,
            JournalEntry.entry_date >= start_date
        ).all()
        
        # Calculate sentiment distribution
        sentiment_counts = {}
        for entry in entries:
            if entry.sentiment:
                sentiment = entry.sentiment.value
                sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
        
        # Calculate average sentiment score
        sentiment_scores = [entry.sentiment_score for entry in entries if entry.sentiment_score is not None]
        avg_sentiment_score = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else None
        
        journal_summary = {
            'total_entries': len(entries),
            'sentiment_distribution': sentiment_counts,
            'average_sentiment_score': round(avg_sentiment_score, 2) if avg_sentiment_score else None,
            'period_days': days
        }
        
        return jsonify({'journal_summary': journal_summary}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch journal summary', 'details': str(e)}), 500

@users_bp.route('/data-export', methods=['GET'])
@jwt_required()
def export_user_data():
    """
    Export all user data for backup or migration
    Returns comprehensive user data in JSON format
    """
    # Extract user ID from JWT token
    current_user_id = get_jwt_identity()
    
    try:
        # Get user data
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get all user's data
        habits = Habit.query.filter_by(user_id=current_user_id).all()
        check_ins = CheckIn.query.filter_by(user_id=current_user_id).all()
        goals = Goal.query.filter_by(user_id=current_user_id).all()
        journal_entries = JournalEntry.query.filter_by(user_id=current_user_id).all()
        
        # Prepare export data
        export_data = {
            'user': user.to_dict(),
            'habits': [habit.to_dict() for habit in habits],
            'check_ins': [check_in.to_dict() for check_in in check_ins],
            'goals': [goal.to_dict() for goal in goals],
            'journal_entries': [entry.to_dict() for entry in journal_entries],
            'export_date': datetime.now().isoformat(),
            'total_records': {
                'habits': len(habits),
                'check_ins': len(check_ins),
                'goals': len(goals),
                'journal_entries': len(journal_entries)
            }
        }
        
        return jsonify({'export_data': export_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to export user data', 'details': str(e)}), 500
