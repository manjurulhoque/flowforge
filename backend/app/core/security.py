"""Security primitives: password hashing and JWT tokens.

Uses ``bcrypt`` directly (passlib is unmaintained and emits warnings with
recent bcrypt releases). All token creation/validation lives here so the
rest of the codebase depends on a single, testable surface.
"""

import secrets
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.core.config import get_settings

# Token type claim values: "access" | "refresh"
TokenType = str

_TOKEN_TYPE_CLAIM = "typ"


class TokenError(ValueError):
    """Raised when a token is malformed, expired or invalid."""


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt (automatic salt)."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except ValueError:
        return False


def create_token(
    subject: str,
    token_type: TokenType,
    *,
    expires_delta: timedelta | None = None,
    extra_claims: dict[str, object] | None = None,
) -> str:
    """Create a signed JWT.

    Args:
        subject: The token subject (user id as string).
        token_type: ``access`` or ``refresh`` — encoded in a ``typ`` claim.
        expires_delta: Override the default lifetime for this token type.
        extra_claims: Optional additional claims (e.g. ``{"scopes": [...]}``).
    """
    settings = get_settings()
    lifetime = expires_delta or (
        timedelta(minutes=settings.access_token_expire_minutes)
        if token_type == "access"
        else timedelta(days=settings.refresh_token_expire_days)
    )
    now = datetime.now(UTC)
    payload: dict[str, object] = {
        "sub": subject,
        "jti": secrets.token_hex(16),
        _TOKEN_TYPE_CLAIM: token_type,
        "iat": now,
        "exp": now + lifetime,
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.token_algorithm)


def decode_token(token: str, expected_type: TokenType) -> dict[str, object]:
    """Validate a JWT and return its payload.

    Raises:
        TokenError: If the token is expired, malformed or of the wrong type.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.token_algorithm],
        )
    except jwt.ExpiredSignatureError as exc:
        raise TokenError("Token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise TokenError("Invalid token") from exc

    if payload.get(_TOKEN_TYPE_CLAIM) != expected_type:
        raise TokenError(f"Expected a {expected_type} token")
    if not payload.get("sub"):
        raise TokenError("Token is missing a subject")
    return payload
