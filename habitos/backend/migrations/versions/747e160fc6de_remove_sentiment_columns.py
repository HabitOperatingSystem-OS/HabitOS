"""remove sentiment columns

Revision ID: 747e160fc6de
Revises: 9b840cb7b0ed
Create Date: 2025-08-04 12:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '747e160fc6de'
down_revision = '9b840cb7b0ed'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Remove sentiment and sentiment_score columns from journal_entries table
    op.drop_column('journal_entries', 'sentiment_score')
    op.drop_column('journal_entries', 'sentiment')


def downgrade() -> None:
    # Re-add sentiment and sentiment_score columns (if needed for rollback)
    op.add_column('journal_entries', sa.Column('sentiment', sa.Enum('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'very_negative', 'very_positive', 'negative', 'neutral', 'positive', name='sentimenttype'), nullable=True))
    op.add_column('journal_entries', sa.Column('sentiment_score', sa.Float(), nullable=True))
