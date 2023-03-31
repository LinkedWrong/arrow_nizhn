from dataclasses import asdict
from sqlalchemy import select, update
from sqlalchemy.orm import joinedload, selectinload
import strawberry
from typing import Any
from sqlalchemy.dialects.postgresql import insert as pg_insert

from strawberry.types import Info
from app.context import CustomContext
from app.types import GroupType, UserType
from app.utils import Error
from models.models import Schedule, Group, User


@strawberry.type
class CreateGroupResult:
    group: GroupType


@strawberry.input
class CreateGroupInput:
    schedule_id: int | None = None
    name: str


@strawberry.type
class CreateGroupError(Error):
    ...


@strawberry.type
class AddUserResult:
    user: UserType


@strawberry.input
class AddUserInput:
    user: int


@strawberry.type
class AddUserError(Error):
    ...


@strawberry.type
class DeleteUserResult:
    user: UserType


@strawberry.input
class DeleteUserInput:
    user: int


@strawberry.type
class DeleteUserError(Error):
    ...


@strawberry.type
class UpdateGroupResult:
    group: GroupType


@strawberry.input
class UpdateGroupInput:
    name: str | None = None
    schedule_id: int | None = None


@strawberry.type
class UpdateGroupError(Error):
    ...


@strawberry.type
class GroupMutation:
    id: int | None = None

    @strawberry.field
    async def create(
        self, inp: CreateGroupInput, info: Info[CustomContext, Any]
    ) -> CreateGroupResult | CreateGroupError:
        async with info.context.session() as s:
            if not inp.schedule_id:
                g = (
                    await s.execute(
                        pg_insert(Group)
                        .values(name=inp.name)
                        .on_conflict_do_nothing()
                        .returning(Group)
                    )
                ).scalar()
                await s.commit()

                if not g:
                    return CreateGroupError(message="Хз что произошло")
                return CreateGroupResult(group=GroupType(id=g.id, name=g.name))

            sc = (
                await s.execute(
                    select(Schedule)
                    .where(Schedule.id == inp.schedule_id)
                    .options(joinedload(Schedule.groups)),
                )
            ).scalar()
            if not sc:
                return CreateGroupError(message="Нет расмписания с этмим ID")

            g = Group(name=inp.name, schedule_id=sc.id, schedule=sc)
            sc.groups.append(g)

            await s.commit()

            return CreateGroupResult(
                group=GroupType(id=g.id, name=g.name, schedule_id=g.schedule_id)
            )

    @strawberry.field
    async def add_user(
        self, inp: AddUserInput, info: Info[CustomContext, Any]
    ) -> AddUserResult | AddUserError:
        if not self.id:
            return AddUserError(message="Группа не найдена")
        async with info.context.session() as s:
            u = await s.get(User, inp.user)
            if not u:
                return AddUserError(message="Пользователь не найден")

            g = (
                await s.execute(
                    select(Group)
                    .where(Group.id == self.id)
                    .options(joinedload(Group.users))
                )
            ).scalar()
            if not g:
                return AddUserError(message="Группа не найдена")
            # print(g)
            g.users.append(u)
            await s.commit()
            return AddUserResult(
                user=UserType(
                    id=u.id,
                    name=u.name,
                )
            )

    @strawberry.field
    async def delete_user(
        self, inp: DeleteUserInput, info: Info[CustomContext, Any]
    ) -> DeleteUserResult | DeleteUserError:
        if not self.id:
            return DeleteUserError(message="Группа не найдена")

        async with info.context.session() as s:
            u = await s.get(User, inp.user)
            if not u:
                return DeleteUserError(message="Пользователь не найден")
            await s.commit()

            g: Group | None = (
                await s.execute(
                    select(Group)
                    .where(Group.id == self.id)
                    .options(joinedload(Group.users))
                )
            ).scalar()

            if not g:
                return DeleteUserError(message="Группа не найдена")
            
            # await s.commit()
            # await s.flush()
            # print("ДО ЗАВПРОСААААА")
            # print(g.users)
            g.users.remove(u)
            await s.commit()

            

            return DeleteUserResult(
                user=UserType(
                    id=u.id,
                    name=u.name,
                )
            )

    @strawberry.field
    async def update(
        self, inp: UpdateGroupInput, info: Info[CustomContext, Any]
    ) -> UpdateGroupResult | UpdateGroupError:
        async with info.context.session() as s:
            g = (
                await s.execute(
                    update(Group)
                    .where(Group.id == self.id)
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
                    .returning(Group)
                )
            ).scalar()

            if not g:
                return UpdateGroupError(message="Несуществующая группа")
            # print(g)
            await s.commit()
            return UpdateGroupResult(
                group=GroupType(id=g.id, name=g.name, schedule_id=g.schedule_id)
            )
