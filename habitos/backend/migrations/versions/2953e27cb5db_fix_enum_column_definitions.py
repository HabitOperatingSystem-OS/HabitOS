"""fix_enum_column_definitions

Revision ID: 2953e27cb5db
Revises: 79a9777b54ea
Create Date: 2025-07-23 16:53:22.573770

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2953e27cb5db'
down_revision: Union[str, Sequence[str], None] = '79a9777b54ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
