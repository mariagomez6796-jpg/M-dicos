import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_session
from app.models import Room
from app.auth import bearer_auth

router = APIRouter(prefix="/rooms", tags=["Rooms"])

class RoomCreate(BaseModel):
    title: str | None = None

@router.post("", dependencies=[Depends(bearer_auth)])
async def create_room(body: RoomCreate, session: AsyncSession = Depends(get_session)):
    code = secrets.token_urlsafe(6)
    room = Room(code=code, title=body.title or None)
    session.add(room)
    await session.commit()
    await session.refresh(room)
    return {"code": room.code, "title": room.title}

@router.get("/{code}", dependencies=[Depends(bearer_auth)])
async def get_room(code: str, session: AsyncSession = Depends(get_session)):
    q = await session.execute(select(Room).where(Room.code == code))
    room = q.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Sala no encontrada")
    return {"code": room.code, "title": room.title, "created_at": str(room.created_at)}

@router.delete("/{code}", dependencies=[Depends(bearer_auth)])
async def delete_room(code: str, session: AsyncSession = Depends(get_session)):
    res = await session.execute(delete(Room).where(Room.code == code))
    await session.commit()
    return {"deleted": res.rowcount or 0}
