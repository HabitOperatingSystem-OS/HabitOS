"""update_existing_habit_categories_to_lowercase

Revision ID: a4f10bf474e0
Revises: 99531a32d422
Create Date: 2025-07-23 17:06:27.527603

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a4f10bf474e0'
down_revision: Union[str, Sequence[str], None] = '99531a32d422'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # First convert category column to text to allow any values
    op.execute("ALTER TABLE habits ALTER COLUMN category TYPE text")
    
    # Update existing habit categories from uppercase to lowercase
    op.execute("UPDATE habits SET category = 'personal' WHERE category = 'PERSONAL'")
    op.execute("UPDATE habits SET category = 'health' WHERE category = 'HEALTH'")
    op.execute("UPDATE habits SET category = 'fitness' WHERE category = 'FITNESS'")
    op.execute("UPDATE habits SET category = 'productivity' WHERE category = 'PRODUCTIVITY'")
    op.execute("UPDATE habits SET category = 'mindfulness' WHERE category = 'MINDFULNESS'")
    op.execute("UPDATE habits SET category = 'learning' WHERE category = 'LEARNING'")
    op.execute("UPDATE habits SET category = 'social' WHERE category = 'SOCIAL'")
    op.execute("UPDATE habits SET category = 'creative' WHERE category = 'CREATIVE'")
    op.execute("UPDATE habits SET category = 'other' WHERE category = 'OTHER'")
    
    # Convert category column back to enum
    op.execute("ALTER TABLE habits ALTER COLUMN category TYPE habitcategory USING category::habitcategory")
    
    # First convert frequency column to text to allow any values
    op.execute("ALTER TABLE habits ALTER COLUMN frequency TYPE text")
    
    # Update existing habit frequencies from uppercase to lowercase
    op.execute("UPDATE habits SET frequency = 'daily' WHERE frequency = 'DAILY'")
    op.execute("UPDATE habits SET frequency = 'weekly' WHERE frequency = 'WEEKLY'")
    op.execute("UPDATE habits SET frequency = 'monthly' WHERE frequency = 'MONTHLY'")
    op.execute("UPDATE habits SET frequency = 'custom' WHERE frequency = 'CUSTOM'")
    
    # Convert frequency column back to enum
    op.execute("ALTER TABLE habits ALTER COLUMN frequency TYPE habitfrequency USING frequency::habitfrequency")

def downgrade() -> None:
    """Downgrade schema."""
    # Revert habit categories from lowercase to uppercase
    op.execute("UPDATE habits SET category = 'PERSONAL' WHERE category = 'personal'")
    op.execute("UPDATE habits SET category = 'HEALTH' WHERE category = 'health'")
    op.execute("UPDATE habits SET category = 'FITNESS' WHERE category = 'fitness'")
    op.execute("UPDATE habits SET category = 'PRODUCTIVITY' WHERE category = 'productivity'")
    op.execute("UPDATE habits SET category = 'MINDFULNESS' WHERE category = 'mindfulness'")
    op.execute("UPDATE habits SET category = 'LEARNING' WHERE category = 'learning'")
    op.execute("UPDATE habits SET category = 'SOCIAL' WHERE category = 'social'")
    op.execute("UPDATE habits SET category = 'CREATIVE' WHERE category = 'creative'")
    op.execute("UPDATE habits SET category = 'OTHER' WHERE category = 'other'")
    
    # Revert habit frequencies from lowercase to uppercase
    op.execute("UPDATE habits SET frequency = 'DAILY' WHERE frequency = 'daily'")
    op.execute("UPDATE habits SET frequency = 'WEEKLY' WHERE frequency = 'weekly'")
    op.execute("UPDATE habits SET frequency = 'MONTHLY' WHERE frequency = 'monthly'")
    op.execute("UPDATE habits SET frequency = 'CUSTOM' WHERE frequency = 'custom'")
