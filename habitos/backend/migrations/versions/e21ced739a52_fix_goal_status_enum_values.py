"""fix_goal_status_enum_values

Revision ID: e21ced739a52
Revises: 6178ee9a90de
Create Date: 2025-07-23 13:48:17.297938

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e21ced739a52'
down_revision: Union[str, Sequence[str], None] = '6178ee9a90de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Temporarily change the column type to text to avoid enum constraints
    op.execute("ALTER TABLE goals ALTER COLUMN status TYPE text")
    
    # Update existing goal status values from uppercase to lowercase
    op.execute("UPDATE goals SET status = 'active' WHERE status = 'ACTIVE'")
    op.execute("UPDATE goals SET status = 'completed' WHERE status = 'COMPLETED'")
    op.execute("UPDATE goals SET status = 'paused' WHERE status = 'PAUSED'")
    op.execute("UPDATE goals SET status = 'cancelled' WHERE status = 'CANCELLED'")
    
    # Drop the old enum type
    op.execute("DROP TYPE goalstatus")
    
    # Create the new enum type with lowercase values
    op.execute("CREATE TYPE goalstatus AS ENUM ('active', 'completed', 'paused', 'cancelled')")
    
    # Change the column type back to the new enum
    op.execute("ALTER TABLE goals ALTER COLUMN status TYPE goalstatus USING status::goalstatus")


def downgrade() -> None:
    """Downgrade schema."""
    # Temporarily change the column type to text to avoid enum constraints
    op.execute("ALTER TABLE goals ALTER COLUMN status TYPE text")
    
    # Update existing goal status values from lowercase to uppercase
    op.execute("UPDATE goals SET status = 'ACTIVE' WHERE status = 'active'")
    op.execute("UPDATE goals SET status = 'COMPLETED' WHERE status = 'completed'")
    op.execute("UPDATE goals SET status = 'PAUSED' WHERE status = 'paused'")
    op.execute("UPDATE goals SET status = 'CANCELLED' WHERE status = 'cancelled'")
    
    # Drop the new enum type
    op.execute("DROP TYPE goalstatus")
    
    # Create the old enum type with uppercase values
    op.execute("CREATE TYPE goalstatus AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED')")
    
    # Change the column type back to the old enum
    op.execute("ALTER TABLE goals ALTER COLUMN status TYPE goalstatus USING status::goalstatus")
