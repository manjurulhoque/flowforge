"""WebSocket collaboration foundation.

This endpoint authenticates the socket, registers it against a project and
broadcasts JSON messages. Today it implements presence + broadcast for
architecture patches — the exact message protocol that real-time
collaboration, simulation streaming and AI progress reporting will build on.

Message shape (JSON text frames)::

    {"type": "hello", "data": {"projectId": "..."}}
    {"type": "patch",  "data": {"nodes": [...], "edges": [...]}}
    {"type": "presence", "data": {"userId": "...", "connected": true}}
"""

import asyncio
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.security import TokenError, decode_token

logger = logging.getLogger(__name__)

router = APIRouter()

# project_id → {websocket: user_id}
_project_connections: dict[str, dict[WebSocket, str]] = {}


@router.websocket("/ws/projects/{project_id}")
async def project_socket(websocket: WebSocket, project_id: str) -> None:
    # Auth happens on the handshake via ?token= query param (browser WS API
    # cannot set headers).
    token = websocket.query_params.get("token")
    if token:
        try:
            payload = decode_token(token, "access")
            user_id: str = payload["sub"]
        except TokenError:
            await websocket.close(code=4401, reason="Invalid or expired token")
            return
    else:
        await websocket.close(code=4401, reason="Missing token")
        return

    await websocket.accept()
    connections = _project_connections.setdefault(project_id, {})
    connections[websocket] = user_id
    await _broadcast(
        project_id, {"type": "presence", "data": {"userId": user_id, "connected": True}}
    )

    try:
        while True:
            raw = await websocket.receive_json()
            await _handle_message(project_id, websocket, raw)
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("WebSocket error on project %s", project_id)
    finally:
        connections.pop(websocket, None)
        if not connections:
            _project_connections.pop(project_id, None)
        await _broadcast(
            project_id,
            {"type": "presence", "data": {"userId": user_id, "connected": False}},
        )
        await websocket.close()


async def _handle_message(project_id: str, sender: WebSocket, raw: object) -> None:
    msg_type = raw.get("type") if isinstance(raw, dict) else None
    data = raw.get("data") if isinstance(raw, dict) else None

    if msg_type == "patch":
        # In the future, patches are validated, ordered and persisted here.
        await _broadcast(project_id, {"type": "patch", "data": data}, exclude=sender)
    elif msg_type == "ping":
        await sender.send_json({"type": "pong"})
    else:
        message = f"Unknown message type: {msg_type!r}"
        await sender.send_json({"type": "error", "data": {"message": message}})


async def _broadcast(
    project_id: str, message: dict, *, exclude: WebSocket | None = None
) -> None:
    connections = _project_connections.get(project_id, {})
    recipients = [ws for ws in connections if ws is not exclude]
    if not recipients:
        return
    await asyncio.gather(
        *(ws.send_json(message) for ws in recipients),
        return_exceptions=True,
    )
