"""
Validation utilities for the HabitOS application
"""
from typing import Type, TypeVar, List
from enum import Enum

T = TypeVar('T', bound=Enum)

def validate_enum_value(value: str, enum_class: Type[T]) -> T:
    """
    Validate that a string value is a valid enum value
    
    Args:
        value: The string value to validate
        enum_class: The enum class to validate against
        
    Returns:
        The enum instance if valid
        
    Raises:
        ValueError: If the value is not valid for the enum
    """
    valid_values = [e.value for e in enum_class]
    if value not in valid_values:
        raise ValueError(f"Invalid value '{value}'. Must be one of: {valid_values}")
    return enum_class(value)

def get_enum_values(enum_class: Type[T]) -> List[str]:
    """
    Get all valid values for an enum class
    
    Args:
        enum_class: The enum class
        
    Returns:
        List of valid enum values as strings
    """
    return [e.value for e in enum_class]

def validate_goal_status(status: str) -> str:
    """
    Validate goal status value
    
    Args:
        status: The status string to validate
        
    Returns:
        The validated status string
        
    Raises:
        ValueError: If the status is not valid
    """
    from app.models.goal import GoalStatus
    
    # Map frontend values to backend enum values
    status_mapping = {
        'active': 'in_progress',  # Frontend sends 'active', backend expects 'in_progress'
        'in_progress': 'in_progress',
        'completed': 'completed',
        'abandoned': 'abandoned'
    }
    
    # Convert the status to the expected backend value
    mapped_status = status_mapping.get(status, status)
    
    return validate_enum_value(mapped_status, GoalStatus).value

def validate_goal_priority(priority: str) -> str:
    """
    Validate goal priority value
    
    Args:
        priority: The priority string to validate
        
    Returns:
        The validated priority string
        
    Raises:
        ValueError: If the priority is not valid
    """
    from app.models.goal import GoalPriority
    return validate_enum_value(priority, GoalPriority).value

def validate_goal_type(goal_type: str) -> str:
    """
    Validate goal type value
    
    Args:
        goal_type: The goal type string to validate
        
    Returns:
        The validated goal type string
        
    Raises:
        ValueError: If the goal type is not valid
    """
    from app.models.goal import GoalType
    return validate_enum_value(goal_type, GoalType).value 