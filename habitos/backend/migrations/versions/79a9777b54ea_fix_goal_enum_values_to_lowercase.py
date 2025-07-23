"""fix_goal_enum_values_to_lowercase

Revision ID: 79a9777b54ea
Revises: 59d55596962d
Create Date: 2025-07-23 16:50:17.817631

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '79a9777b54ea'
down_revision: Union[str, Sequence[str], None] = '59d55596962d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Fix goal_type enum values
    op.execute("ALTER TABLE goals ALTER COLUMN goal_type TYPE text")
    op.execute("UPDATE goals SET goal_type = 'count' WHERE goal_type = 'COUNT'")
    op.execute("UPDATE goals SET goal_type = 'duration' WHERE goal_type = 'DURATION'")
    op.execute("UPDATE goals SET goal_type = 'distance' WHERE goal_type = 'DISTANCE'")
    op.execute("UPDATE goals SET goal_type = 'weight' WHERE goal_type = 'WEIGHT'")
    op.execute("UPDATE goals SET goal_type = 'custom' WHERE goal_type = 'CUSTOM'")
    
    # Drop old enum type
    op.execute("DROP TYPE goaltype")
    
    # Create new enum type with lowercase values
    op.execute("CREATE TYPE goaltype AS ENUM ('count', 'duration', 'distance', 'weight', 'custom')")
    
    # Change column type back to enum
    op.execute("ALTER TABLE goals ALTER COLUMN goal_type TYPE goaltype USING goal_type::goaltype")
    
    # Fix priority enum values - remove default first
    op.execute("ALTER TABLE goals ALTER COLUMN priority DROP DEFAULT")
    op.execute("ALTER TABLE goals ALTER COLUMN priority TYPE text")
    op.execute("UPDATE goals SET priority = 'low' WHERE priority = 'LOW'")
    op.execute("UPDATE goals SET priority = 'medium' WHERE priority = 'MEDIUM'")
    op.execute("UPDATE goals SET priority = 'high' WHERE priority = 'HIGH'")
    
    # Drop old enum type
    op.execute("DROP TYPE goalpriority")
    
    # Create new enum type with lowercase values
    op.execute("CREATE TYPE goalpriority AS ENUM ('low', 'medium', 'high')")
    
    # Change column type back to enum and set default
    op.execute("ALTER TABLE goals ALTER COLUMN priority TYPE goalpriority USING priority::goalpriority")
    op.execute("ALTER TABLE goals ALTER COLUMN priority SET DEFAULT 'medium'")


def downgrade() -> None:
    """Downgrade schema."""
    # Revert goal_type enum values
    op.execute("ALTER TABLE goals ALTER COLUMN goal_type TYPE text")
    op.execute("UPDATE goals SET goal_type = 'COUNT' WHERE goal_type = 'count'")
    op.execute("UPDATE goals SET goal_type = 'DURATION' WHERE goal_type = 'duration'")
    op.execute("UPDATE goals SET goal_type = 'DISTANCE' WHERE goal_type = 'distance'")
    op.execute("UPDATE goals SET goal_type = 'WEIGHT' WHERE goal_type = 'weight'")
    op.execute("UPDATE goals SET goal_type = 'CUSTOM' WHERE goal_type = 'custom'")
    
    # Drop new enum type
    op.execute("DROP TYPE goaltype")
    
    # Create old enum type with uppercase values
    op.execute("CREATE TYPE goaltype AS ENUM ('COUNT', 'DURATION', 'DISTANCE', 'WEIGHT', 'CUSTOM')")
    
    # Change column type back to enum
    op.execute("ALTER TABLE goals ALTER COLUMN goal_type TYPE goaltype USING goal_type::goaltype")
    
    # Revert priority enum values - remove default first
    op.execute("ALTER TABLE goals ALTER COLUMN priority DROP DEFAULT")
    op.execute("ALTER TABLE goals ALTER COLUMN priority TYPE text")
    op.execute("UPDATE goals SET priority = 'LOW' WHERE priority = 'low'")
    op.execute("UPDATE goals SET priority = 'MEDIUM' WHERE priority = 'medium'")
    op.execute("UPDATE goals SET priority = 'HIGH' WHERE priority = 'high'")
    
    # Drop new enum type
    op.execute("DROP TYPE goalpriority")
    
    # Create old enum type with uppercase values
    op.execute("CREATE TYPE goalpriority AS ENUM ('LOW', 'MEDIUM', 'HIGH')")
    
    # Change column type back to enum and set default
    op.execute("ALTER TABLE goals ALTER COLUMN priority TYPE goalpriority USING priority::goalpriority")
    op.execute("ALTER TABLE goals ALTER COLUMN priority SET DEFAULT 'MEDIUM'")
