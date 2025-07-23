"""fix_goal_type_enum_values

Revision ID: 64d7f8c98f92
Revises: 110e067a3c05
Create Date: 2025-07-23 14:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '64d7f8c98f92'
down_revision: Union[str, Sequence[str], None] = '110e067a3c05'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Fix goaltype enum - convert from uppercase to lowercase
    # Temporarily change the column type to text to avoid enum constraints
    op.execute("ALTER TABLE goals ALTER COLUMN goal_type TYPE text")
    
    # Update existing goal type values from uppercase to lowercase
    op.execute("UPDATE goals SET goal_type = 'count' WHERE goal_type = 'COUNT'")
    op.execute("UPDATE goals SET goal_type = 'duration' WHERE goal_type = 'DURATION'")
    op.execute("UPDATE goals SET goal_type = 'distance' WHERE goal_type = 'DISTANCE'")
    op.execute("UPDATE goals SET goal_type = 'weight' WHERE goal_type = 'WEIGHT'")
    op.execute("UPDATE goals SET goal_type = 'custom' WHERE goal_type = 'CUSTOM'")
    
    # Drop the old enum type
    op.execute("DROP TYPE goaltype")
    
    # Create the new enum type with lowercase values
    op.execute("CREATE TYPE goaltype AS ENUM ('count', 'duration', 'distance', 'weight', 'custom')")
    
    # Change the column type back to the new enum
    op.execute("ALTER TABLE goals ALTER COLUMN goal_type TYPE goaltype USING goal_type::goaltype")


def downgrade() -> None:
    """Downgrade schema."""
    # Fix goaltype enum - convert from lowercase to uppercase
    # Temporarily change the column type to text to avoid enum constraints
    op.execute("ALTER TABLE goals ALTER COLUMN goal_type TYPE text")
    
    # Update existing goal type values from lowercase to uppercase
    op.execute("UPDATE goals SET goal_type = 'COUNT' WHERE goal_type = 'count'")
    op.execute("UPDATE goals SET goal_type = 'DURATION' WHERE goal_type = 'duration'")
    op.execute("UPDATE goals SET goal_type = 'DISTANCE' WHERE goal_type = 'distance'")
    op.execute("UPDATE goals SET goal_type = 'WEIGHT' WHERE goal_type = 'weight'")
    op.execute("UPDATE goals SET goal_type = 'CUSTOM' WHERE goal_type = 'custom'")
    
    # Drop the new enum type
    op.execute("DROP TYPE goaltype")
    
    # Create the old enum type with uppercase values
    op.execute("CREATE TYPE goaltype AS ENUM ('COUNT', 'DURATION', 'DISTANCE', 'WEIGHT', 'CUSTOM')")
    
    # Change the column type back to the old enum
    op.execute("ALTER TABLE goals ALTER COLUMN goal_type TYPE goaltype USING goal_type::goaltype")
