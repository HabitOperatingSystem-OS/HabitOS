"""fix_goal_enum_defaults

Revision ID: 110e067a3c05
Revises: e21ced739a52
Create Date: 2025-07-23 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '110e067a3c05'
down_revision: Union[str, Sequence[str], None] = 'e21ced739a52'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Fix goalpriority enum - convert from uppercase to lowercase
    # Temporarily change the column type to text to avoid enum constraints
    op.execute("ALTER TABLE goals ALTER COLUMN priority TYPE text")
    
    # Update existing goal priority values from uppercase to lowercase
    op.execute("UPDATE goals SET priority = 'low' WHERE priority = 'LOW'")
    op.execute("UPDATE goals SET priority = 'medium' WHERE priority = 'MEDIUM'")
    op.execute("UPDATE goals SET priority = 'high' WHERE priority = 'HIGH'")
    
    # Drop the old enum type
    op.execute("DROP TYPE goalpriority")
    
    # Create the new enum type with lowercase values
    op.execute("CREATE TYPE goalpriority AS ENUM ('low', 'medium', 'high')")
    
    # Change the column type back to the new enum
    op.execute("ALTER TABLE goals ALTER COLUMN priority TYPE goalpriority USING priority::goalpriority")
    
    # Set the default value
    op.execute("ALTER TABLE goals ALTER COLUMN priority SET DEFAULT 'medium'")
    
    # Fix goalstatus enum defaults (already done in previous migration, just set default)
    op.execute("ALTER TABLE goals ALTER COLUMN status SET DEFAULT 'active'")


def downgrade() -> None:
    """Downgrade schema."""
    # Fix goalpriority enum - convert from lowercase to uppercase
    # Temporarily change the column type to text to avoid enum constraints
    op.execute("ALTER TABLE goals ALTER COLUMN priority TYPE text")
    
    # Update existing goal priority values from lowercase to uppercase
    op.execute("UPDATE goals SET priority = 'LOW' WHERE priority = 'low'")
    op.execute("UPDATE goals SET priority = 'MEDIUM' WHERE priority = 'medium'")
    op.execute("UPDATE goals SET priority = 'HIGH' WHERE priority = 'high'")
    
    # Drop the new enum type
    op.execute("DROP TYPE goalpriority")
    
    # Create the old enum type with uppercase values
    op.execute("CREATE TYPE goalpriority AS ENUM ('LOW', 'MEDIUM', 'HIGH')")
    
    # Change the column type back to the old enum
    op.execute("ALTER TABLE goals ALTER COLUMN priority TYPE goalpriority USING priority::goalpriority")
    
    # Set the old default value
    op.execute("ALTER TABLE goals ALTER COLUMN priority SET DEFAULT 'MEDIUM'")
    
    # Fix goalstatus enum defaults
    op.execute("ALTER TABLE goals ALTER COLUMN status SET DEFAULT 'ACTIVE'")
