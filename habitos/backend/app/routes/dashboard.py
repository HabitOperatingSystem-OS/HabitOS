from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func, and_
from app.models.user import User
from app.models.habit import Habit
from app.models.check_in import CheckIn
from app.models.goal import Goal
from app import db

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard', methods=['OPTIONS'])
@dashboard_bp.route('/api/dashboard/', methods=['OPTIONS'])
def handle_dashboard_preflight():
    """Handle preflight OPTIONS requests for dashboard"""
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

@dashboard_bp.route('/api/dashboard', methods=['GET'])
@dashboard_bp.route('/api/dashboard/', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    """Get dashboard data for the authenticated user"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get user
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get today's date
        today = datetime.now().date()
        
        # Get active habits count
        active_habits_count = Habit.query.filter_by(
            user_id=current_user_id, 
            active=True
        ).count()

        # Get current streak (simplified - you might want to implement more complex logic)
        # This is a placeholder implementation
        current_streak = 7  # Placeholder

        # Get completion rate for today
        today_check_ins = CheckIn.query.filter(
            and_(
                CheckIn.user_id == current_user_id,
                func.date(CheckIn.created_at) == today
            )
        ).count()
        
        today_habits = Habit.query.filter_by(
            user_id=current_user_id, 
            active=True
        ).count()
        
        completion_rate = round((today_check_ins / today_habits * 100) if today_habits > 0 else 0)

        # Get goals achieved count
        goals_achieved = Goal.query.filter_by(
            user_id=current_user_id, 
            status='COMPLETED'
        ).count()

        # Get streak data for the last 7 days
        streak_data = []
        labels = []
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            labels.append(date.strftime('%a'))
            
            # Count check-ins for this day
            day_check_ins = CheckIn.query.filter(
                and_(
                    CheckIn.user_id == current_user_id,
                    func.date(CheckIn.created_at) == date
                )
            ).count()
            streak_data.append(day_check_ins)

        # Get today's habits with check-in status
        today_habits_list = []
        habits = Habit.query.filter_by(
            user_id=current_user_id, 
            active=True
        ).all()
        
        for habit in habits:
            # Check if habit was completed today
            check_in = CheckIn.query.filter(
                and_(
                    CheckIn.habit_id == habit.id,
                    CheckIn.user_id == current_user_id,
                    func.date(CheckIn.created_at) == today
                )
            ).first()
            
            # Get mood from check-in if exists
            mood = check_in.mood_rating if check_in else None
            
            # Calculate streak (simplified)
            streak = 5  # Placeholder - you'd implement actual streak calculation
            
            today_habits_list.append({
                'id': habit.id,
                'name': habit.title,
                'category': habit.category.value,
                'streak': streak,
                'completed': check_in is not None,
                'time': 'Throughout day',
                'mood': mood
            })

        # Get mood summary from recent check-ins
        recent_check_ins = CheckIn.query.filter(
            CheckIn.user_id == current_user_id
        ).order_by(CheckIn.created_at.desc()).limit(10).all()
        
        mood_counts = {}
        total_check_ins = len(recent_check_ins)
        
        for check_in in recent_check_ins:
            if check_in.mood_rating:
                mood_counts[check_in.mood_rating] = mood_counts.get(check_in.mood_rating, 0) + 1
        
        recent_moods = []
        for mood, count in mood_counts.items():
            percentage = round((count / total_check_ins) * 100) if total_check_ins > 0 else 0
            recent_moods.append({
                'mood': mood,
                'count': count,
                'percentage': percentage
            })
        
        # Sort by count descending
        recent_moods.sort(key=lambda x: x['count'], reverse=True)
        
        # Get average mood (most common)
        average_mood = recent_moods[0]['mood'] if recent_moods else 'neutral'

        dashboard_data = {
            'stats': {
                'activeHabits': active_habits_count,
                'currentStreak': current_streak,
                'completionRate': completion_rate,
                'goalsAchieved': goals_achieved
            },
            'streakData': {
                'labels': labels,
                'datasets': [{
                    'label': 'Habit Completion Streak',
                    'data': streak_data,
                    'borderColor': 'rgb(59, 130, 246)',
                    'backgroundColor': 'rgba(59, 130, 246, 0.1)',
                    'tension': 0.4,
                    'fill': True,
                }]
            },
            'todaysHabits': today_habits_list,
            'moodSummary': {
                'recentMoods': recent_moods,
                'averageMood': average_mood,
                'totalCheckIns': total_check_ins
            }
        }

        return jsonify(dashboard_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500 