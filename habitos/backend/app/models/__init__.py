# Import all models to ensure they're registered with SQLAlchemy
from .user import User
from .habit import Habit, HabitCategory, HabitFrequency
from .check_in import CheckIn
from .goal import Goal, GoalType, GoalStatus, GoalPriority
from .journal_entry import JournalEntry, SentimentType

__all__ = [
    'User',
    'Habit', 'HabitCategory', 'HabitFrequency',
    'CheckIn',
    'Goal', 'GoalType', 'GoalStatus', 'GoalPriority',
    'JournalEntry', 'SentimentType'
]