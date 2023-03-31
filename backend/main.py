# ./server.py
from fastapi import FastAPI, HTTPException
from sqlalchemy import insert, select
from app.context import engine
from app import graphql_app
from models.base import Base
from models.models import User

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)  # type: ignore


from pydantic import BaseModel as BM
from app.context import async_session


class SignUpInput(BM):
    name: str
    login: str
    password: str
    code: str


@app.post("/sign_up")
async def sign_up(inp: SignUpInput):
    async with async_session() as session:
        u = (
            await session.execute(select(User).where(User.login == inp.login))
        ).scalar_one_or_none()
        if u:
            raise HTTPException(
                status_code=409, detail="Пользователь с таким логином уже существует"
            )
        if inp.code != "secret":
            raise HTTPException(status_code=404, detail="Введенный код не подходит")
        user = User(name=inp.name, login=inp.login, password=inp.password)
        session.add(user)
        await session.commit()
    return "okk"


class LogInInput(BM):
    login: str
    password: str


import jwt


@app.post("/login")
async def login(inp: LogInInput) -> str:
    async with async_session() as session:
        u = (
            await session.execute(
                select(User)
                .where(User.login == inp.login)
                .where(User.password == inp.password)
            )
        ).scalar_one_or_none()
        if not u:
            raise HTTPException(
                status_code=403, detail="Неправильный логин иоли пароль"
            )

        encoded_jwt = jwt.encode(
            {"id": u.id, "role": u.role.value, "name": u.name, "login": u.login},
            "secret",
            algorithm="HS256",
        )
        return encoded_jwt


app.include_router(graphql_app, prefix="/graphql")
