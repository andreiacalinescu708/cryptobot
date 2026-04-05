from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ApiKeyCreate(BaseModel):
    api_key: str = Field(..., min_length=10)
    api_secret: str = Field(..., min_length=10)
    is_testnet: bool = False


class ApiKeyResponse(BaseModel):
    id: int
    is_active: bool
    is_testnet: bool
    created_at: datetime
    # Nu returnăm niciodată cheile decriptate!
    
    class Config:
        from_attributes = True


class ApiKeyUpdate(BaseModel):
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    is_testnet: Optional[bool] = None
    is_active: Optional[bool] = None
