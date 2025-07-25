"""update_goal_status_enum_values

Revision ID: 38835bbb2885
Revises: 110e067a3c05
Create Date: 2025-07-23 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '38835bbb2885'
down_revision: Union[str, Sequence[str], None] = '110e067a3c05'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # First, remove the default value to avoid dependency issues
    op.execute("ALTER TABLE goals ALTER COLUMN status DROP DEFAULT")
    
    # Temporarily change the column type to text to avoid enum constraints
    op.execute("ALTER TABLE goals ALTER COLUMN status TYPE text")
    
    # Update existing goal status values to match new enum
    op.execute("UPDATE goals SET status = 'in_progress' WHERE status = 'active'")
    op.execute("UPDATE goals SET status = 'abandoned' WHERE status = 'paused'")
    op.execute("UPDATE goals SET status = 'abandoned' WHERE status = 'cancelled'")
    
    # Drop the old enum type
    op.execute("DROP TYPE goalstatus")
    
    # Create the new enum type with updated values
    op.execute("CREATE TYPE goalstatus AS ENUM ('in_progress', 'completed', 'abandoned')")
    
    # Change the column type back to the new enum
    op.execute("ALTER TABLE goals ALTER COLUMN status TYPE goalstatus USING status::goalstatus")
    
    # Set the default value
    op.execute("ALTER TABLE goals ALTER COLUMN status SET DEFAULT 'in_progress'")


def downgrade() -> None:
    """Downgrade schema."""
    # First, remove the default value to avoid dependency issues
    op.execute("ALTER TABLE goals ALTER COLUMN status DROP DEFAULT")
    
    # Temporarily change the column type to text to avoid enum constraints
    op.execute("ALTER TABLE goals ALTER COLUMN status TYPE text")
    
    # Update existing goal status values back to old enum
    op.execute("UPDATE goals SET status = 'active' WHERE status = 'in_progress'")
    op.execute("UPDATE goals SET status = 'paused' WHERE status = 'abandoned'")
    
    # Drop the new enum type
    op.execute("DROP TYPE goalstatus")
    
    # Create the old enum type with original values
    op.execute("CREATE TYPE goalstatus AS ENUM ('active', 'completed', 'paused', 'cancelled')")
    
    # Change the column type back to the old enum
    op.execute("ALTER TABLE goals ALTER COLUMN status TYPE goalstatus USING status::goalstatus")
    
    # Set the old default value
    op.execute("ALTER TABLE goals ALTER COLUMN status SET DEFAULT 'active'")
