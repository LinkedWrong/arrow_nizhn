from datetime import datetime, timedelta
import enum
from typing import Literal, Optional
from sqlalchemy import Column, ForeignKey, String, Table
from sqlalchemy.orm import Mapped, relationship

from models.base import Base, mapped_column


LIMIT = 50


class Role(enum.Enum):
    MENTOR = "mentor"
    STUDENT = "student"

    def __bool__(self) -> bool:
        if self.value == Role.MENTOR.value:
            return True
        return False


ugassociation_table = Table(
    "ugassociation_table",
    Base.metadata,
    Column("left_id", ForeignKey("users.id"), primary_key=True),
    Column("right_id", ForeignKey("groups.id"), primary_key=True),
)


esassociation_table = Table(
    "esassociation_table",
    Base.metadata,
    Column("left_id", ForeignKey("events.id"), primary_key=True),
    Column("right_id", ForeignKey("schedules.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"
    name: Mapped[str] = mapped_column(String(LIMIT))
    login: Mapped[str] = mapped_column(String(LIMIT))
    password: Mapped[str] = mapped_column(String(LIMIT))
    role: Mapped[Role] = mapped_column(insertion_default=lambda: Role.STUDENT)
    groups: Mapped[list["Group"]] = relationship(
        secondary=ugassociation_table,
        back_populates="users",
        # default_factory=list,
        cascade="all, delete",
    )
    events: Mapped[list["Event"]] = relationship()


class Group(Base):
    __tablename__ = "groups"
    name: Mapped[str] = mapped_column(String(LIMIT))
    schedule_id: Mapped[int | None] = mapped_column(
        ForeignKey("schedules.id"),
        nullable=True,
    )
    schedule: Mapped[Optional["Schedule"]] = relationship(
        back_populates="groups",
    )
    users: Mapped[list[User]] = relationship(
        back_populates="groups",
        secondary=ugassociation_table,
        # default_factory=list,
        lazy=None,
        cascade="all, delete",
    )


class Event(Base):
    __tablename__ = "events"
    maintainer_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    maintainer: Mapped[User | None] = relationship(
        back_populates="events",
    )
    start: Mapped[datetime] = mapped_column(insert_default=datetime.now)
    end: Mapped[datetime | None] = mapped_column()
    name: Mapped[str] = mapped_column(String(LIMIT))
    schedules: Mapped[list["Schedule"]] = relationship(
        back_populates="events",
        secondary=esassociation_table,
    )


class Schedule(Base):
    __tablename__ = "schedules"
    static: Mapped[bool] = mapped_column(insertion_default=lambda: True)
    events: Mapped[list[Event]] = relationship(
        secondary=esassociation_table,
    )
    name: Mapped[str] = mapped_column(String(LIMIT))
    groups: Mapped[list["Group"]] = relationship(
        back_populates="schedule",
    )
    start: Mapped[datetime] = mapped_column(insert_default=datetime.now)
    end: Mapped[datetime | None] = mapped_column()
