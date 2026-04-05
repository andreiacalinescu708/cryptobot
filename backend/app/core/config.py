from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Database - Railway provides DATABASE_URL automatically
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/crypto_trading_bot")
    
    # Security - Must be set in Railway environment variables!
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Encryption for API Keys
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "your-encryption-key-here-32bytes!")
    
    # App
    APP_NAME: str = "Crypto Trading Bot"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # CORS - Frontend URL (set in Railway)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3002")
    
    # SendGrid
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
