# from datetime import datetime
# from typing import TYPE_CHECKING, Any
# from sqlalchemy import select
# import strawberry
# from strawberry.types import Info

# from models.models import Event, Schedule
# from sqlalchemy.orm import joinedload


# if TYPE_CHECKING:
#     from .events import EventType
#     from app import CustomContext

from typing import Any
from sqlalchemy import select
import strawberry
from strawberry.types import Info

from app.types import ScheduleType
from app.context import CustomContext
from models.models import Schedule


@strawberry.type
class SchedulesQuery:
    @strawberry.field
    async def filter(self, info: Info["CustomContext", Any]) -> list[ScheduleType]:
        async with info.context.session() as s:
            return [
                ScheduleType(
                    id=row.t[0].id,
                    static=row.t[0].static,
                    name=row.t[0].name,
                    start=row.t[0].start,
                    end=row.t[0].end,
                )
                for row in (await s.execute(select(Schedule))).all()
            ]
