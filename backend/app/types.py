from datetime import datetime
from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from strawberry.types import Info
from typing import TYPE_CHECKING
from app.context import CustomContext

from datetime import datetime
import strawberry

from models.models import Schedule, Group, User


@strawberry.type
class EventType:
    id: int
    name: str
    start: datetime
    maintainer_id: int | None = None
    end: datetime | None = None


@strawberry.type
class Events:
    start_day_hour: int = 8
    end_day_hour: int = 19
    inner: list[EventType]


@strawberry.type
class ScheduleType:
    id: int
    static: bool
    name: str
    start: datetime
    end: datetime | None = None

    @strawberry.field
    async def events(self, info: Info["CustomContext", Any]) -> Events:
        async with info.context.session() as s:
            data = [
                EventType(
                    id=e.id,
                    name=e.name,
                    start=e.start,
                    end=e.end,
                )
                for e in sorted(
                    (
                        await s.execute(
                            select(Schedule)
                            .where(Schedule.id == self.id)
                            .options(joinedload(Schedule.events))
                        )
                    )
                    .scalar()
                    .events,  # type: ignore
                    key=lambda e: e.start,
                )
            ]
            evts = Events(inner=data)
            if data:
                evts.start_day_hour = min(data, key=lambda e: e.start).start.hour
            if data:
                evts.end_day_hour = max(data, key=lambda e: e.end or datetime(year=2002, month=12, day=4, hour=19)).start.hour + 2
            
            return evts

        

    @strawberry.field
    async def groups(self, info: Info["CustomContext", Any]) -> list["GroupType"]:
        async with info.context.session() as s:
            return [
                GroupType(
                    id=g.id,
                    schedule_id=self.id,
                    name=g.name,
                )
                for g in (
                    await s.execute(
                        select(Schedule)
                        .where(Schedule.id == self.id)
                        .options(joinedload(Schedule.groups))
                    )
                )
                .scalar()
                .groups  # type: ignore
            ]


@strawberry.type
class UserType:
    id: int
    name: str

    @strawberry.field
    async def groups(self, info: Info["CustomContext", Any]) -> list["GroupType"]:
        async with info.context.session() as s:
            u = (
                await s.execute(
                    select(User)
                    .where(User.id == self.id)
                    .options(joinedload(User.groups))
                )
            ).scalar()
            if not u:
                return []
            return [
                GroupType(
                    id=g.id,
                    schedule_id=g.schedule_id,
                    name=g.name,
                )
                for g in u.groups
            ]


@strawberry.type
class GroupType:
    id: int
    name: str
    schedule_id: int | None = None

    @strawberry.field
    async def schedule(self, info: Info["CustomContext", Any]) -> ScheduleType | None:
        if not self.schedule_id:
            return None

        async with info.context.session() as s:
            sc = await s.get(Schedule, self.schedule_id)

            if not sc:
                raise
            return ScheduleType(
                id=sc.id,
                static=sc.static,
                name=sc.name,
                start=sc.start,
                end=sc.end,
            )

    @strawberry.field
    async def users(self, info: Info["CustomContext", Any]) -> list[UserType]:
        async with info.context.session() as s:
            g = (
                await s.execute(
                    select(Group)
                    .where(Group.id == self.id)
                    .options(joinedload(Group.users))
                )
            ).scalar()
            if not g:
                raise

        return [UserType(id=u.id, name=u.name) for u in g.users]
