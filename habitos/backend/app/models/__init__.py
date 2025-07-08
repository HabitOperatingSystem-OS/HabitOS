from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy instance
db = SQLAlchemy()

# Import all models
from .user import User
from .habit import Habit, HabitCategory, HabitFrequency, HabitStatus
from .check_in import CheckIn, MoodLevel
from .goal import Goal, GoalType, GoalStatus, GoalPriority
from .journal_entry import JournalEntry, SentimentType, JournalEntryType

# Export all models and enums
__all__ = [
    'db',
    'User',
    'Habit',
    'HabitCategory',
    'HabitFrequency', 
    'HabitStatus',
    'CheckIn',
    'MoodLevel',
    'Goal',
    'GoalType',
    'GoalStatus',
    'GoalPriority',
    'JournalEntry',
    'SentimentType',
    'JournalEntryType'
]