# main.py
import asyncio
from fastapi import FastAPI, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import config
from app.database import engine, Base
from app.routers import auth as auth_router
from app.routers import rooms as rooms_router
from app.routers import ws as ws_router

# 👉 Importa el esquema Bearer para que Swagger muestre "Authorize"
from app.auth import bearer_scheme  # definido en app/auth.py

tags_metadata = [
    {"name": "auth", "description": "Login simple y emisión de JWT"},
    {"name": "rooms", "description": "Gestión de salas de videollamada"},
    {"name": "ws", "description": "Señalización WebRTC vía WebSocket"},
]

app = FastAPI(
    title=config.APP_NAME,
    description="API de videollamadas (solo backend) con JWT y señalización WebRTC",
    version="1.0.0",
    openapi_tags=tags_metadata,
)

# CORS abierto (ajusta para prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sirve el HTML mínimo (token + código de sala)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.on_event("startup")
async def on_start():
    # Crea tablas si no existen
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Routers
app.include_router(auth_router.router, tags=["auth"])
app.include_router(rooms_router.router, tags=["rooms"])
app.include_router(ws_router.router, tags=["ws"])

@app.get("/")
def root():
    return {
        "ok": True,
        "name": config.APP_NAME,
        "docs": "/docs",
        "web": "/static/index.html",
    }

# Healthcheck para compose
@app.get("/healthz")
def healthz():
    return {"status": "ok"}

# 👉 Endpoint oculto que referencia el esquema Bearer (asegura botón Authorize)
@app.get("/__secure_check", include_in_schema=False, dependencies=[Security(bearer_scheme)])
def __secure_check():
    return {"ok": True}

