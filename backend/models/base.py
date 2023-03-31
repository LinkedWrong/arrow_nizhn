from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass, Mapped, mapped_column


class Base(
    # MappedAsDataclass,
    DeclarativeBase,
):
    __abstract__ = True
    id: Mapped[int] = mapped_column(primary_key=True, default=None)
    created_at: Mapped[datetime] = mapped_column(
        insert_default=datetime.now, default=None
    )
    updated_at: Mapped[datetime] = mapped_column(
        insert_default=datetime.now, onupdate=datetime.now, default=None
    )
