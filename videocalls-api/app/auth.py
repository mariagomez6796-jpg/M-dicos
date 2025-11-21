# app/auth.py
import time
from typing import Optional
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from app import config

# Esquema Bearer para Swagger (Authorize)
bearer_scheme = HTTPBearer(auto_error=True)

def create_token(sub: str, extra: Optional[dict] = None):
    now = int(time.time())
    payload = {"sub": sub, "iat": now, "exp": now + config.JWT_EXPIRES_MIN * 60}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")

def verify_token(token: str):
    try:
        return jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def bearer_auth(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)):
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Falta Bearer token")
    return verify_token(credentials.credentials)
