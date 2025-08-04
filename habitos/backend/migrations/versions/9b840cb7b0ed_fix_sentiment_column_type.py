"""fix_sentiment_column_type

Revision ID: 9b840cb7b0ed
Revises: 7e7f113473ab
Create Date: 2025-08-04 12:15:30.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '9b840cb7b0ed'
down_revision: Union[str, Sequence[str], None] = '7e7f113473ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # The sentiment column is currently VARCHAR(13) but should be the sentimenttype enum
    # We need to change the column type to use the enum
    
    # First, let's check if there are any existing sentiment values that need to be preserved
    # Since we saw that existing sentiment values are empty, we can safely change the type
    
    # Change the column type from VARCHAR to the sentimenttype enum
    op.alter_column('journal_entries', 'sentiment', 
                   type_=postgresql.ENUM('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'very_negative', 'very_positive', 'negative', 'neutral', 'positive', name='sentimenttype'),
                   existing_type=sa.VARCHAR(13),
                   postgresql_using="sentiment::sentimenttype")


def downgrade() -> None:
    """Downgrade schema."""
    # Change the column type back to VARCHAR
    op.alter_column('journal_entries', 'sentiment', 
                   type_=sa.VARCHAR(13),
                   existing_type=postgresql.ENUM('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'very_negative', 'very_positive', 'negative', 'neutral', 'positive', name='sentimenttype'),
                   postgresql_using="sentiment::varchar")
