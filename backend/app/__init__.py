from dataclasses import dataclass
import jwt
from pydantic import BaseModel

from app.context import get_context
from app.schema import schema

from strawberry.fastapi import GraphQLRouter


graphql_app = GraphQLRouter(schema, context_getter=get_context, debug=True)
