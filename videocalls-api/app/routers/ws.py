from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, Set
from app.auth import verify_token

router = APIRouter(prefix="/ws", tags=["WebSocket"])

# In-memory rooms {code: set(WebSocket)}
ROOMS: Dict[str, Set[WebSocket]] = {}

@router.websocket("/{code}")
async def signaling_ws(ws: WebSocket, code: str, token: str = Query(None)):
    # Expect token as a query param ?token=... (since browsers can't set headers easily)
    if not token:
        await ws.close(code=4401)
        return
    try:
        verify_token(token)
    except Exception:
        await ws.close(code=4401)
        return

    await ws.accept()
    peers = ROOMS.setdefault(code, set())
    peers.add(ws)

    # Notify others that a new peer joined
    for p in peers:
        if p is not ws:
            try:
                await p.send_json({"type": "peer-join"})
            except Exception:
                pass

    try:
        while True:
            data = await ws.receive_json()
            # Relay signaling messages to other peers in the same room
            for p in list(peers):
                if p is not ws:
                    try:
                        await p.send_json(data)
                    except Exception:
                        pass
    except WebSocketDisconnect:
        pass
    finally:
        peers.discard(ws)
        if not peers:
            ROOMS.pop(code, None)
        else:
            # Notify remaining peers
            for p in list(peers):
                try:
                    await p.send_json({"type": "peer-leave"})
                except Exception:
                    pass
