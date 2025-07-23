"""merge_heads

Revision ID: 59d55596962d
Revises: 38835bbb2885, 64d7f8c98f92
Create Date: 2025-07-23 15:37:06.808107

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '59d55596962d'
down_revision: Union[str, Sequence[str], None] = ('38835bbb2885', '64d7f8c98f92')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
