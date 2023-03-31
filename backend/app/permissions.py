from typing import TYPE_CHECKING, Any, Awaitable
from strawberry import BasePermission
from strawberry.types import Info

from models.models import Role

if TYPE_CHECKING:
    from app.context import CustomContext


class IsMentor(BasePermission):
    message = "Не автроизован"

    async def has_permission(
        self, source: Any, info: Info["CustomContext", Any], **kwargs
    ) -> bool | Awaitable[bool]:
        print(info.context.user)
        if info.context.user:
            return info.context.user.role == Role.MENTOR
        return False


class IsStudent(BasePermission):
    message = "Не автроизован"

    async def has_permission(
        self, source: Any, info: Info["CustomContext", Any], **kwargs
    ) -> bool | Awaitable[bool]:
        if info.context.user:
            return info.context.user.role in (Role.STUDENT, Role.MENTOR)
        return False
