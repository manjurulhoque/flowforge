"""Authentication dependencies: extract and validate the JWT user."""

import uuid
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedError
from app.core.security import TokenError, decode_token
from app.dependencies.db import get_db
from app.models import User
from app.repositories import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


async def _resolve_user(
    credentials: HTTPAuthorizationCredentials | None,
    session: AsyncSession,
) -> User:
    if credentials is None:
        raise UnauthorizedError(message="Missing bearer token")

    try:
        payload = decode_token(credentials.credentials, "access")
    except TokenError as exc:
        raise UnauthorizedError(message=str(exc)) from exc

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise UnauthorizedError(message="Token subject is invalid") from exc

    user = await UserRepository(session).get(user_id)
    if user is None or not user.is_active:
        raise UnauthorizedError(message="User is inactive or no longer exists")
    return user


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    session: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Require a valid access token; raise 401 otherwise."""
    return await _resolve_user(credentials, session)


async def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    session: Annotated[AsyncSession, Depends(get_db)],
) -> User | None:
    """Resolve the user if a valid token is present, else ``None``.

    Used by public endpoints (e.g. unauthenticated validation).
    """
    if credentials is None:
        return None
    try:
        return await _resolve_user(credentials, session)
    except UnauthorizedError:
        return None
