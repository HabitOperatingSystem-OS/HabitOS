"""fix_habit_category_enum_values

Revision ID: 99531a32d422
Revises: 2953e27cb5db
Create Date: 2025-07-23 16:55:28.286915

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '99531a32d422'
down_revision: Union[str, Sequence[str], None] = '2953e27cb5db'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Fix habit category enum values
    op.execute("ALTER TABLE habits ALTER COLUMN category TYPE text")
    op.execute("UPDATE habits SET category = 'personal' WHERE category = 'PERSONAL'")
    op.execute("UPDATE habits SET category = 'health' WHERE category = 'HEALTH'")
    op.execute("UPDATE habits SET category = 'fitness' WHERE category = 'FITNESS'")
    op.execute("UPDATE habits SET category = 'productivity' WHERE category = 'PRODUCTIVITY'")
    op.execute("UPDATE habits SET category = 'mindfulness' WHERE category = 'MINDFULNESS'")
    op.execute("UPDATE habits SET category = 'learning' WHERE category = 'LEARNING'")
    op.execute("UPDATE habits SET category = 'social' WHERE category = 'SOCIAL'")
    op.execute("UPDATE habits SET category = 'creative' WHERE category = 'CREATIVE'")
    op.execute("UPDATE habits SET category = 'other' WHERE category = 'OTHER'")
    
    # Drop old enum type
    op.execute("DROP TYPE habitcategory")
    
    # Create new enum type with lowercase values
    op.execute("CREATE TYPE habitcategory AS ENUM ('personal', 'health', 'fitness', 'productivity', 'mindfulness', 'learning', 'social', 'creative', 'other')")
    
    # Change column type back to enum and set default
    op.execute("ALTER TABLE habits ALTER COLUMN category TYPE habitcategory USING category::habitcategory")
    op.execute("ALTER TABLE habits ALTER COLUMN category SET DEFAULT 'personal'")
    
    # Fix habit frequency enum values
    op.execute("ALTER TABLE habits ALTER COLUMN frequency DROP DEFAULT")
    op.execute("ALTER TABLE habits ALTER COLUMN frequency TYPE text")
    op.execute("UPDATE habits SET frequency = 'daily' WHERE frequency = 'DAILY'")
    op.execute("UPDATE habits SET frequency = 'weekly' WHERE frequency = 'WEEKLY'")
    op.execute("UPDATE habits SET frequency = 'monthly' WHERE frequency = 'MONTHLY'")
    op.execute("UPDATE habits SET frequency = 'custom' WHERE frequency = 'CUSTOM'")
    
    # Drop old enum type
    op.execute("DROP TYPE habitfrequency")
    
    # Create new enum type with lowercase values
    op.execute("CREATE TYPE habitfrequency AS ENUM ('daily', 'weekly', 'monthly', 'custom')")
    
    # Change column type back to enum and set default
    op.execute("ALTER TABLE habits ALTER COLUMN frequency TYPE habitfrequency USING frequency::habitfrequency")
    op.execute("ALTER TABLE habits ALTER COLUMN frequency SET DEFAULT 'daily'")


def downgrade() -> None:
    """Downgrade schema."""
    # Revert habit category enum values
    op.execute("ALTER TABLE habits ALTER COLUMN category DROP DEFAULT")
    op.execute("ALTER TABLE habits ALTER COLUMN category TYPE text")
    op.execute("UPDATE habits SET category = 'PERSONAL' WHERE category = 'personal'")
    op.execute("UPDATE habits SET category = 'HEALTH' WHERE category = 'health'")
    op.execute("UPDATE habits SET category = 'FITNESS' WHERE category = 'fitness'")
    op.execute("UPDATE habits SET category = 'PRODUCTIVITY' WHERE category = 'productivity'")
    op.execute("UPDATE habits SET category = 'MINDFULNESS' WHERE category = 'mindfulness'")
    op.execute("UPDATE habits SET category = 'LEARNING' WHERE category = 'learning'")
    op.execute("UPDATE habits SET category = 'SOCIAL' WHERE category = 'social'")
    op.execute("UPDATE habits SET category = 'CREATIVE' WHERE category = 'creative'")
    op.execute("UPDATE habits SET category = 'OTHER' WHERE category = 'other'")
    
    # Drop new enum type
    op.execute("DROP TYPE habitcategory")
    
    # Create old enum type with uppercase values
    op.execute("CREATE TYPE habitcategory AS ENUM ('PERSONAL', 'HEALTH', 'FITNESS', 'PRODUCTIVITY', 'MINDFULNESS', 'LEARNING', 'SOCIAL', 'CREATIVE', 'OTHER')")
    
    # Change column type back to enum and set default
    op.execute("ALTER TABLE habits ALTER COLUMN category TYPE habitcategory USING category::habitcategory")
    op.execute("ALTER TABLE habits ALTER COLUMN category SET DEFAULT 'PERSONAL'")
    
    # Revert habit frequency enum values
    op.execute("ALTER TABLE habits ALTER COLUMN frequency DROP DEFAULT")
    op.execute("ALTER TABLE habits ALTER COLUMN frequency TYPE text")
    op.execute("UPDATE habits SET frequency = 'DAILY' WHERE frequency = 'daily'")
    op.execute("UPDATE habits SET frequency = 'WEEKLY' WHERE frequency = 'weekly'")
    op.execute("UPDATE habits SET frequency = 'MONTHLY' WHERE frequency = 'monthly'")
    op.execute("UPDATE habits SET frequency = 'CUSTOM' WHERE frequency = 'custom'")
    
    # Drop new enum type
    op.execute("DROP TYPE habitfrequency")
    
    # Create old enum type with uppercase values
    op.execute("CREATE TYPE habitfrequency AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')")
    
    # Change column type back to enum and set default
    op.execute("ALTER TABLE habits ALTER COLUMN frequency TYPE habitfrequency USING frequency::habitfrequency")
    op.execute("ALTER TABLE habits ALTER COLUMN frequency SET DEFAULT 'DAILY'")
