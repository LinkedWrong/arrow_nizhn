from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any
from sqlalchemy import delete, select, update
from sqlalchemy.orm import joinedload
import strawberry

from strawberry.types import Info
from app.context import CustomContext
from app.types import EventType, GroupType, ScheduleType
from app.utils import Result, Error
from models.models import Schedule, Event, Group


@strawberry.type
class CreateScheduleResult:
    schedule: ScheduleType


@strawberry.input
class CreateScheduleInput:
    static: bool
    name: str
    start: datetime
    end: datetime | None = None


@strawberry.input
class EventTypeInput:
    name: str
    start: datetime
    id: int | None = None
    maintainer: int | None = None
    end: datetime | None = None


@strawberry.input
class AddEventsInput:
    events: list[EventTypeInput]


@strawberry.type
class AddEventsResult:
    schedule: ScheduleType


@strawberry.type
class AddEventsError(Error):
    schedule: ScheduleType | None = None


@strawberry.input
class UpdateEventInput:
    id: int
    name: str | None = None
    start: datetime | None = None
    maintainer: int | None = None
    end: datetime | None = None


@strawberry.type
class UpdateEventResult:
    event: EventType


@strawberry.type
class UpdateEventError(Error):
    schedule: ScheduleType | None = None


@strawberry.input
class AddGroupInput:
    group: int


@strawberry.type
class AddGroupResult:
    group: GroupType


@strawberry.type
class AddGroupError(Error):
    ...


@strawberry.input
class UpdateScheduleInput:
    name: str | None = None
    start: datetime | None = None
    end: datetime | None = None


@strawberry.type
class UpdateScheduleResult:
    schedule: ScheduleType


@strawberry.type
class UpdateScheduleError(Error):
    schedule: ScheduleType | None = None


@strawberry.type
class ScheduleMutation:
    id: int | None = None

    @strawberry.field
    async def create(
        self, inp: CreateScheduleInput, info: Info[CustomContext, Any]
    ) -> CreateScheduleResult:
        async with info.context.session() as s:
            sc = Schedule(
                static=inp.static,
                name=inp.name,
                start=inp.start,
                **(dict(end=inp.end) if inp.end else dict())
            )
            s.add(sc)
            await s.commit()
        return CreateScheduleResult(
            schedule=ScheduleType(
                id=sc.id,
                static=sc.static,
                name=sc.name,
                start=sc.start,
                end=sc.end,
            )
        )

    @strawberry.field
    async def delete(self, info: Info[CustomContext, Any]) -> ScheduleType | None:
        async with info.context.session() as s:
            sc = (
                await s.execute(
                    delete(Schedule).where(Schedule.id == self.id).returning(Schedule)
                )
            ).scalar()
            if not sc:
                return None

            await s.commit()
        return ScheduleType(
            id=sc.id,
            static=sc.static,
            name=sc.name,
            start=sc.start,
            end=sc.end,
        )

    @strawberry.field
    async def add_events(
        self, inp: AddEventsInput, info: Info[CustomContext, Any]
    ) -> AddEventsResult | AddEventsError:
        async with info.context.session() as s:
            sc = (
                await s.execute(
                    select(Schedule)
                    .where(Schedule.id == self.id)
                    .options(joinedload(Schedule.events))
                )
            ).scalar()
            if not sc:
                return AddEventsError(message="Несуществующее расписание")

            for e in inp.events:
                sc.events.append(
                    Event(
                        maintainer_id=e.maintainer,
                        start=e.start,
                        end=e.end,
                        name=e.name,
                    )
                )
            await s.commit()

            return AddEventsResult(
                schedule=ScheduleType(
                    id=sc.id,
                    end=sc.end,
                    name=sc.name,
                    start=sc.start,
                    static=sc.static,
                )
            )

            return AddEventsError(message="всё ок но хуй тебе")

    @strawberry.field
    async def update_event(
        self, event: UpdateEventInput, info: Info[CustomContext, Any]
    ) -> UpdateEventResult | UpdateEventError:
        async with info.context.session() as s:
            e = (
                await s.execute(
                    update(Event)
                    .where(Event.id == event.id)
                    .values(
                        **dict(
                            list(
                                filter(
                                    lambda t: bool(t[-1]) and not t[0] == "id",
                                    asdict(event).items(),
                                )
                            )
                        )
                    )
                    .returning(Event)
                )
            ).scalar()
            if not e:
                return UpdateEventError(message="Несуществующее занятие")

            await s.commit()

            return UpdateEventResult(
                event=EventType(
                    id=e.id,
                    maintainer_id=e.maintainer_id,
                    start=e.start,
                    end=e.end,
                    name=e.name,
                )
            )

            return AddEventsError(message="всё ок но хуй тебе")

    @strawberry.field
    async def update(
        self, schedule: UpdateScheduleInput, info: Info[CustomContext, Any]
    ) -> UpdateScheduleResult | UpdateScheduleError:
        async with info.context.session() as s:
            sc = (
                await s.execute(
                    update(Schedule)
                    .where(Schedule.id == self.id)
                    .values(
                        **dict(
                            list(
                                filter(
                                    lambda t: bool(t[-1]) and not t[0] == "id",
                                    asdict(schedule).items(),
                                )
                            )
                        )
                    )
                    .returning(Schedule)
                )
            ).scalar()
            if not sc:
                return UpdateScheduleError(message="Несуществующее занятие")

            await s.commit()

            return UpdateScheduleResult(
                schedule=ScheduleType(
                    id=sc.id,
                    static=sc.static,
                    start=sc.start,
                    end=sc.end,
                    name=sc.name,
                )
            )

    @strawberry.field
    async def add_group(
        self, inp: "AddGroupInput", info: Info[CustomContext, Any]
    ) -> AddGroupResult | AddGroupError:
        async with info.context.session() as s:
            sc = (
                await s.execute(
                    select(Schedule)
                    .where(Schedule.id == self.id)
                    .options(joinedload(Schedule.groups))
                )
            ).scalar()
            if not sc:
                return AddGroupError(message="Несуществующее расписание")

            g = (
                await s.execute(
                    select(Group)
                    .where(Group.id == inp.group)
                    .options(joinedload(Group.users))
                )
            ).scalar()
            if not g:
                return AddGroupError(message="Группа не найдена")

            sc.groups.append(g)
            await s.commit()
            return AddGroupResult(
                group=GroupType(id=g.id, name=g.name, schedule_id=g.schedule_id)
            )
