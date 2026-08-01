"""Authentication service — the only place auth business logic lives."""

import hashlib
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    TokenError,
    create_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models import RefreshToken, User
from app.repositories import RefreshTokenRepository, UserRepository
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenPair,
    UserOut,
)


def _digest(token: str) -> str:
    """SHA-256 digest of a refresh token (what we store in the DB)."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class AuthService:
    """Handles registration, login, token rotation and logout."""

    def __init__(
        self,
        session: AsyncSession,
        users: UserRepository | None = None,
        tokens: RefreshTokenRepository | None = None,
    ):
        self._session = session
        self.users = users or UserRepository(session)
        self.tokens = tokens or RefreshTokenRepository(session)

    # ── public API ──────────────────────────────────────────────────────

    async def register(self, request: RegisterRequest) -> tuple[User, TokenPair]:
        email = request.email.lower().strip()
        if await self.users.find_by_email(email) is not None:
            raise ConflictError(message="An account with this email already exists")

        user = User(
            email=email,
            password_hash=hash_password(request.password),
            name=request.name.strip() or email.split("@")[0],
        )
        await self.users.add(user)
        pair = await self._issue_token_pair(user)
        await self._session.commit()
        return user, pair

    async def login(self, request: LoginRequest) -> tuple[User, TokenPair]:
        email = request.email.lower().strip()
        user = await self.users.find_by_email(email)
        if user is None or not verify_password(request.password, user.password_hash):
            raise UnauthorizedError(message="Invalid email or password")
        if not user.is_active:
            raise UnauthorizedError(message="This account has been deactivated")

        pair = await self._issue_token_pair(user)
        await self._session.commit()
        return user, pair

    async def refresh(self, refresh_token: str) -> TokenPair:
        try:
            payload = decode_token(refresh_token, "refresh")
        except TokenError as exc:
            raise UnauthorizedError(message=str(exc)) from exc

        stored = await self.tokens.find_by_hash(_digest(refresh_token))
        if stored is None or stored.revoked_at is not None:
            raise UnauthorizedError(message="Refresh token has been revoked")
        expires_at = stored.expires_at
        if expires_at.tzinfo is None:
            # SQLite returns naive datetimes; normalize before comparing.
            expires_at = expires_at.replace(tzinfo=UTC)
        if expires_at < datetime.now(UTC):
            raise UnauthorizedError(message="Refresh token has expired")

        user_id = payload["sub"]
        try:
            user_uuid = uuid.UUID(user_id)
        except (ValueError, TypeError) as exc:
            raise UnauthorizedError(message="Token subject is invalid") from exc
        user = await self.users.get(user_uuid)
        if user is None or not user.is_active:
            raise UnauthorizedError(message="User is inactive or no longer exists")

        # Rotate: revoke the presented token, issue a fresh pair.
        await self.tokens.revoke(_digest(refresh_token))
        pair = await self._issue_token_pair(user)
        await self._session.commit()
        return pair

    async def logout(self, refresh_token: str) -> None:
        await self.tokens.revoke(_digest(refresh_token))
        await self._session.commit()

    async def get_profile(self, user: User) -> UserOut:
        return UserOut.model_validate(user)

    # ── token issuance ──────────────────────────────────────────────────

    async def _issue_token_pair(self, user: User) -> TokenPair:
        settings = get_settings()
        subject = str(user.id)

        access = create_token(subject, "access")
        refresh = create_token(subject, "refresh")

        await self.tokens.add(
            RefreshToken(
                user_id=user.id,
                token_hash=_digest(refresh),
                expires_at=datetime.now(UTC)
                + timedelta(days=settings.refresh_token_expire_days),
            )
        )
        return TokenPair(
            access_token=access,
            refresh_token=refresh,
            expires_in=settings.access_token_expire_minutes * 60,
        )
