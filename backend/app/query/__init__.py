import strawberry

from app.query.schedules import SchedulesQuery
from app.query.groups import GroupsQuery
from app.query.users import UsersQuery

from app.permissions import IsStudent


@strawberry.type
class Query(UsersQuery):
    schedules: SchedulesQuery = strawberry.field(SchedulesQuery, permission_classes=[IsStudent])  # type: ignore

    groups: GroupsQuery = strawberry.field(GroupsQuery, permission_classes=[IsStudent])  # type: ignore
