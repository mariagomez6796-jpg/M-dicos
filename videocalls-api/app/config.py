import os

APP_NAME = os.getenv("APP_NAME", "Videocalls API")
APP_ENV = os.getenv("APP_ENV", "dev")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
JWT_EXPIRES_MIN = int(os.getenv("JWT_EXPIRES_MIN", "720"))
ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASS", "admin123")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "videocalls")
DB_USER = os.getenv("DB_USER", "app")
DB_PASS = os.getenv("DB_PASS", "app")
