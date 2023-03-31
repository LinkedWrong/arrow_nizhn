from dataclasses import asdict
from sqlalchemy import select, update
from sqlalchemy.orm import joinedload, selectinload
import strawberry
from typing import Any
from sqlalchemy.dialects.postgresql import insert as pg_insert

from strawberry.types import Info
from app.context import CustomContext
from app.types import UserType, UserType
from app.utils import Error
from app.permissions import IsStudent
from models.models import User


@strawberry.type
class UpdateUserResult:
    user: UserType


@strawberry.input
class UpdateUserInput:
    name: str | None = None
    # login: str | None = None


@strawberry.type
class UpdateUserError(Error):
    ...


@strawberry.type
class UsersMutation:
    @strawberry.field(permission_classes=[IsStudent])
    async def update_me(
        self, inp: UpdateUserInput, info: Info[CustomContext, Any]
    ) -> UpdateUserResult | UpdateUserError:
        if not info.context.user:
            return UpdateUserError(message="Пользователь не найден")
        async with info.context.session() as s:
            u = (
                await s.execute(
                    update(User)
                    .where(User.id == info.context.user.id)
                    .values(
                        **dict(
                            list(
                                filter(
                                    lambda t: bool(t[-1]) and not t[0] == "id",
                                    asdict(inp).items(),
                                )
                            )
                        )
                    )
                    .returning(User)
                )
            ).scalar()
            if not u:
                return UpdateUserError(message="Пользователь не найден")
            await s.commit()

            return UpdateUserResult(user=UserType(id=u.id, name=u.name))
