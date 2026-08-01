"""Unit tests for password hashing and JWT handling."""

from datetime import timedelta

import pytest
from app.core.security import (
    TokenError,
    create_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hash_round_trip() -> None:
    digest = hash_password("correct horse battery staple")
    assert digest != "correct horse battery staple"
    assert verify_password("correct horse battery staple", digest)
    assert not verify_password("wrong password", digest)


def test_password_hash_is_salted() -> None:
    assert hash_password("same") != hash_password("same")


def test_verify_password_rejects_garbage() -> None:
    assert not verify_password("whatever", "not-a-hash")


def test_access_token_round_trip() -> None:
    token = create_token(
        "user-123", token_type="access", expires_delta=timedelta(minutes=5)
    )
    payload = decode_token(token, "access")
    assert payload["sub"] == "user-123"
    assert payload["typ"] == "access"


def test_token_type_mismatch_raises() -> None:
    token = create_token(
        "user-123", token_type="refresh", expires_delta=timedelta(minutes=5)
    )
    with pytest.raises(TokenError):
        decode_token(token, "access")


def test_expired_token_raises() -> None:
    token = create_token(
        "user-123", token_type="access", expires_delta=timedelta(seconds=-10)
    )
    with pytest.raises(TokenError):
        decode_token(token, "access")


def test_tampered_token_raises() -> None:
    token = create_token(
        "user-123", token_type="access", expires_delta=timedelta(minutes=5)
    )
    with pytest.raises(TokenError):
        decode_token(token + "junk", "access")
