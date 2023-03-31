from typing import Any
import jwt
from sqlalchemy import select
import strawberry

from strawberry.types import Info
from app.context import CustomContext
from app.utils import Error
from models.models import Role

from models.models import User


@strawberry.input
class SignUpInput:
    name: str
    login: str
    password: str
    code: str


@strawberry.type
class AuthResult:
    token: str


@strawberry.type
class SignUpError(Error):
    pass


@strawberry.input
class LogInInput:
    login: str
    password: str


@strawberry.type
class LoginError(Error):
    pass


@strawberry.type
class AuthMutation:
    @strawberry.field
    async def sign_up(
        self, inp: SignUpInput, info: Info[CustomContext, Any]
    ) -> AuthResult | SignUpError:
        async with info.context.session() as s:
            u = (await s.execute(select(User).where(User.login == inp.login))).scalar()
            if u:
                return SignUpError(
                    code=409,
                    message="Пользователь с таким логином уже существует",
                )
            if inp.code != "secret":
                return SignUpError(
                    code=404,
                    message="Введенный код не подходит",
                )

            user = User(name=inp.name, login=inp.login, password=inp.password, role=Role.STUDENT)

            s.add(user)
            await s.commit()
            encoded_jwt = jwt.encode(
                {
                    "id": user.id,
                    "role": bool(user.role),
                    "name": user.name,
                    "login": user.login,
                },
                "secret",
                algorithm="HS256",
            )
        return AuthResult(token=encoded_jwt)

    @strawberry.field
    async def login(
        self, inp: LogInInput, info: Info[CustomContext, Any]
    ) -> AuthResult | LoginError:
        async with info.context.session() as s:
            u = (
                await s.execute(
                    select(User)
                    .where(User.login == inp.login)
                    .where(User.password == inp.password)
                )
            ).scalar_one_or_none()
            if not u:
                return LoginError(code=403, message="Неправильный логин иоли пароль")

            encoded_jwt = jwt.encode(
                {"id": u.id, "role": bool(u.role), "name": u.name, "login": u.login},
                "secret",
                algorithm="HS256",
            )
            return AuthResult(token=encoded_jwt)
