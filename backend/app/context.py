import jwt
from pydantic import BaseModel
from strawberry.fastapi import GraphQLRouter, BaseContext

from models.base import Base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

from starlette.requests import Request

from models.models import Role

engine = create_async_engine(
    "postgresql+asyncpg://postgres:1@localhost/arrow", echo=True
)


async_session = async_sessionmaker(engine, expire_on_commit=False)


class User(BaseModel):
    id: int
    name: str
    login: str
    role: Role


class CustomContext(BaseContext):
    session: async_sessionmaker[AsyncSession]
    user: User | None

    def __init__(self, session: async_sessionmaker[AsyncSession], user: User | None):
        super().__init__()
        self.session = session
        self.user = user


async def get_context(request: Request) -> CustomContext:
    user = None
    if request:
        encoded = request.headers.get("token", "")
        try:
            data = jwt.decode(encoded, "secret", ["HS256"])
            data["role"] = Role.MENTOR.value if data["role"] else Role.STUDENT.value
            user = User.parse_obj(data)
        except:
            pass

    return CustomContext(session=async_session, user=user)
