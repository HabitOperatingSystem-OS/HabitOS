"""update_sentiment_enum_values

Revision ID: 7e7f113473ab
Revises: 8b432e3930bb
Create Date: 2025-08-04 11:51:03.795276

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7e7f113473ab'
down_revision: Union[str, Sequence[str], None] = '8b432e3930bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Step 1: Add new enum values to the existing sentimenttype enum
    op.execute("ALTER TYPE sentimenttype ADD VALUE IF NOT EXISTS 'very_negative'")
    op.execute("ALTER TYPE sentimenttype ADD VALUE IF NOT EXISTS 'very_positive'")
    op.execute("ALTER TYPE sentimenttype ADD VALUE IF NOT EXISTS 'negative'")
    op.execute("ALTER TYPE sentimenttype ADD VALUE IF NOT EXISTS 'neutral'")
    op.execute("ALTER TYPE sentimenttype ADD VALUE IF NOT EXISTS 'positive'")
    
    # Step 2: Update existing data to use lowercase values
    op.execute("""
        UPDATE journal_entries 
        SET sentiment = CASE 
            WHEN sentiment = 'NEGATIVE' THEN 'negative'
            WHEN sentiment = 'NEUTRAL' THEN 'neutral'
            WHEN sentiment = 'POSITIVE' THEN 'positive'
            ELSE sentiment
        END
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # Update data back to uppercase values
    op.execute("""
        UPDATE journal_entries 
        SET sentiment = CASE 
            WHEN sentiment = 'negative' THEN 'NEGATIVE'
            WHEN sentiment = 'neutral' THEN 'NEUTRAL'
            WHEN sentiment = 'positive' THEN 'POSITIVE'
            ELSE sentiment
        END
    """)
    
    # Note: PostgreSQL doesn't support removing enum values, so we can't remove the new values
    # This is a limitation of PostgreSQL enums
