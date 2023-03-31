import strawberry
from app.mutation import Mutation

from app.query import Query
from app.utils import Error



schema = strawberry.Schema(query=Query, mutation=Mutation, types=[Error])
