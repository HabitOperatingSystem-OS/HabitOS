from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, date
from sqlalchemy import func, and_, desc
from app.models.user import User
from app.models.habit import Habit, HabitFrequency
from app.models.check_in import CheckIn
from app.models.goal import Goal, GoalStatus
from app import db

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard', methods=['OPTIONS'])
@dashboard_bp.route('/dashboard/', methods=['OPTIONS'])
def handle_dashboard_preflight():
    """Handle preflight OPTIONS requests for dashboard"""
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

def calculate_current_streak(user_id):
    """Calculate the current streak for the user's habits"""
    try:
        # Get all active habits for the user
        active_habits = Habit.query.filter_by(user_id=user_id, active=True).all()
        
        if not active_habits:
            return 0
        
        # Get the most recent check-in date across all habits
        latest_check_in = CheckIn.query.filter(
            CheckIn.user_id == user_id,
            CheckIn.completed == True
        ).order_by(desc(CheckIn.date)).first()
        
        if not latest_check_in:
            return 0
        
        today = date.today()
        current_streak = 0
        current_date = today
        
        # Check consecutive days backwards from today
        while current_date >= latest_check_in.date:
            # Check if any habit was completed on this date
            day_check_ins = CheckIn.query.filter(
                and_(
                    CheckIn.user_id == user_id,
                    CheckIn.date == current_date,
                    CheckIn.completed == True
                )
            ).count()
            
            if day_check_ins > 0:
                current_streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        return current_streak
    except Exception as e:
        print(f"Error calculating streak: {e}")
        return 0

def calculate_completion_rate(user_id, days=30):
    """Calculate completion rate over the last N days"""
    try:
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        # Get all active habits
        active_habits = Habit.query.filter_by(user_id=user_id, active=True).all()
        
        if not active_habits:
            return 0
        
        total_expected = 0
        total_completed = 0
        
        for habit in active_habits:
            # Calculate expected completions based on frequency
            current_date = start_date
            while current_date <= end_date:
                if current_date >= habit.start_date:
                    if habit.frequency == HabitFrequency.DAILY:
                        total_expected += 1
                    elif habit.frequency == HabitFrequency.WEEKLY:
                        # Count weeks in the period
                        if current_date.weekday() == 0:  # Start of week (Monday)
                            total_expected += max(habit.frequency_count, 1)
                    elif habit.frequency == HabitFrequency.MONTHLY:
                        # Count months in the period
                        if current_date.day == 1:  # Start of month
                            total_expected += max(habit.frequency_count, 1)
                    elif habit.frequency == HabitFrequency.CUSTOM:
                        # For custom frequency, treat as daily with custom count
                        total_expected += max(habit.frequency_count, 1)
                current_date += timedelta(days=1)
            
            # Count completed check-ins for this habit in the period
            completed_check_ins = CheckIn.query.filter(
                and_(
                    CheckIn.habit_id == habit.id,
                    CheckIn.user_id == user_id,
                    CheckIn.date >= start_date,
                    CheckIn.date <= end_date,
                    CheckIn.completed == True
                )
            ).count()
            
            total_completed += completed_check_ins
        
        # Calculate completion rate and cap at 100%
        if total_expected > 0:
            completion_rate = (total_completed / total_expected) * 100
            return min(round(completion_rate), 100)  # Cap at 100%
        else:
            return 0
    except Exception as e:
        print(f"Error calculating completion rate: {e}")
        return 0

def calculate_goal_progress(user_id):
    """Calculate goal progress and achievements"""
    try:
        # Get all goals for the user
        all_goals = Goal.query.filter_by(user_id=user_id).all()
        
        if not all_goals:
            return {
                'goalsAchieved': 0,
                'totalGoals': 0,
                'inProgressGoals': 0,
                'overdueGoals': 0,
                'completionRate': 0
            }
        
        total_goals = len(all_goals)
        completed_goals = len([g for g in all_goals if g.status == GoalStatus.COMPLETED.value])
        in_progress_goals = len([g for g in all_goals if g.status == GoalStatus.IN_PROGRESS.value])
        overdue_goals = len([g for g in all_goals if g.is_overdue()])
        
        completion_rate = round((completed_goals / total_goals * 100) if total_goals > 0 else 0)
        
        return {
            'goalsAchieved': completed_goals,
            'totalGoals': total_goals,
            'inProgressGoals': in_progress_goals,
            'overdueGoals': overdue_goals,
            'completionRate': completion_rate
        }
    except Exception as e:
        print(f"Error calculating goal progress: {e}")
        return {
            'goalsAchieved': 0,
            'totalGoals': 0,
            'inProgressGoals': 0,
            'overdueGoals': 0,
            'completionRate': 0
        }

@dashboard_bp.route('/dashboard', methods=['GET'])
@dashboard_bp.route('/dashboard/', methods=['GET'])
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
        today = date.today()
        
        # Calculate real statistics
        active_habits_count = Habit.query.filter_by(
            user_id=current_user_id, 
            active=True
        ).count()

        current_streak = calculate_current_streak(current_user_id)
        completion_rate = calculate_completion_rate(current_user_id, days=30)
        goal_data = calculate_goal_progress(current_user_id)

        # Get streak data for the last 7 days
        streak_data = []
        labels = []
        for i in range(6, -1, -1):
            date_check = today - timedelta(days=i)
            labels.append(date_check.strftime('%a'))
            
            # Count completed check-ins for this day
            day_check_ins = CheckIn.query.filter(
                and_(
                    CheckIn.user_id == current_user_id,
                    CheckIn.date == date_check,
                    CheckIn.completed == True
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
                    CheckIn.date == today
                )
            ).first()
            
            # Get mood from check-in if exists
            mood = check_in.mood_rating if check_in else None
            
            # Calculate actual streak for this habit
            habit_streak = 0
            if check_in and check_in.completed:
                # Calculate streak backwards from today
                current_date = today
                while True:
                    day_check_in = CheckIn.query.filter(
                        and_(
                            CheckIn.habit_id == habit.id,
                            CheckIn.user_id == current_user_id,
                            CheckIn.date == current_date,
                            CheckIn.completed == True
                        )
                    ).first()
                    
                    if day_check_in:
                        habit_streak += 1
                        current_date -= timedelta(days=1)
                    else:
                        break
            
            today_habits_list.append({
                'id': habit.id,
                'name': habit.title,
                'category': habit.category.value,
                'streak': habit_streak,
                'completed': check_in is not None and check_in.completed,
                'time': 'Throughout day',
                'mood': mood
            })

        # Get mood summary from recent check-ins
        recent_check_ins = CheckIn.query.filter(
            CheckIn.user_id == current_user_id
        ).order_by(desc(CheckIn.created_at)).limit(20).all()
        
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
                'goalsAchieved': goal_data['goalsAchieved'],
                'totalGoals': goal_data['totalGoals'],
                'inProgressGoals': goal_data['inProgressGoals'],
                'overdueGoals': goal_data['overdueGoals'],
                'goalCompletionRate': goal_data['completionRate']
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
        print(f"Dashboard error: {e}")
        return jsonify({'error': str(e)}), 500 