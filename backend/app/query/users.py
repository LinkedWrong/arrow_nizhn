import strawberry

from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import joinedload

import strawberry
from strawberry.types import Info
from app.types import UserType
from models.models import User

from app.context import CustomContext


@strawberry.type
class UsersQuery:
    @strawberry.field
    async def users(self, info: Info["CustomContext", Any]) -> list["UserType"]:
        async with info.context.session() as s:
            return [
                UserType(id=u.id, name=u.name)
                for u in (await s.execute(select(User))).scalars().all()
            ]

    @strawberry.field
    async def me(self, info: Info["CustomContext", Any]) -> UserType | None:
        if not info.context.user:
            return
        return UserType(
            id=info.context.user.id,
            name=info.context.user.name,
        )
