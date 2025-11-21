from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.auth import create_token
from app import config

router = APIRouter(prefix="/auth", tags=["auth"])  # 👈 minúsculas como en main.py

class LoginReq(BaseModel):
    username: str
    password: str

class LoginResp(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=LoginResp)
async def login(body: LoginReq):
    if body.username == config.ADMIN_USER and body.password == config.ADMIN_PASS:
        token = create_token(sub=body.username, extra={"role": "admin"})
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Credenciales inválidas")