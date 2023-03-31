import strawberry

from app.mutation.schedule import ScheduleMutation
from app.mutation.group import GroupMutation
from app.permissions import IsStudent
from app.mutation.auth import AuthMutation
from app.mutation.me import UsersMutation


@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsStudent])
    async def schedule(self, id: int | None = None) -> ScheduleMutation:
        return ScheduleMutation(id=id)

    @strawberry.field(permission_classes=[IsStudent])
    async def group(self, id: int | None = None) -> GroupMutation:
        return GroupMutation(id=id)

    @strawberry.field(permission_classes=[])
    async def auth(self) -> AuthMutation:
        return AuthMutation()

    @strawberry.field(permission_classes=[])
    async def users(self) -> UsersMutation:
        return UsersMutation()
