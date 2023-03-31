import strawberry

from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import joinedload

import strawberry
from strawberry.types import Info

from models.models import Group, User
from app.types import GroupType
from app.context import CustomContext


@strawberry.type
class GroupsQuery:
    @strawberry.field
    async def all(self, info: Info["CustomContext", Any]) -> list["GroupType"]:
        async with info.context.session() as s:
            return [
                GroupType(
                    id=g.id,
                    schedule_id=g.schedule_id,
                    name=g.name,
                )
                for g in (await s.execute(select(Group))).scalars()
            ]

    @strawberry.field
    async def my(self, info: Info["CustomContext", Any]) -> list["GroupType"]:
        async with info.context.session() as s:
            if not info.context.user:
                return []

            u = (
                await s.execute(
                    select(User)
                    .where(User.id == info.context.user.id)
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
