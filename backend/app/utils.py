from typing import Generic, TypeVar, Union
import strawberry

E = TypeVar("E")
T = TypeVar("T")


@strawberry.interface
class Error:
    message: str
    code: int | None = None


Result = T | Error
