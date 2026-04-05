from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import encrypt_api_key, decrypt_api_key
from app.api.deps import get_current_user, get_tenant_id
from app.models.api_key import BinanceApiKey
from app.schemas import ApiKeyCreate, ApiKeyResponse, ApiKeyUpdate
from app.models.user import User

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


@router.post("/binance", response_model=ApiKeyResponse)
def create_binance_api_key(
    api_data: ApiKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Save Binance API keys (encrypted with AES-256).
    Each tenant has their own isolated API keys.
    """
    # Check if user already has API keys
    existing = db.query(BinanceApiKey).filter(
        BinanceApiKey.tenant_id == tenant_id
    ).first()
    
    # Encrypt keys
    encrypted_key = encrypt_api_key(api_data.api_key)
    encrypted_secret = encrypt_api_key(api_data.api_secret)
    
    if existing:
        # Update existing
        existing.api_key_encrypted = encrypted_key
        existing.api_secret_encrypted = encrypted_secret
        existing.is_testnet = api_data.is_testnet
        existing.is_active = True
    else:
        # Create new
        new_api_key = BinanceApiKey(
            tenant_id=tenant_id,
            api_key_encrypted=encrypted_key,
            api_secret_encrypted=encrypted_secret,
            is_testnet=api_data.is_testnet,
            is_active=True
        )
        db.add(new_api_key)
    
    db.commit()
    
    # Refresh to get created_at
    if existing:
        db.refresh(existing)
        return existing
    else:
        new_api_key = db.query(BinanceApiKey).filter(
            BinanceApiKey.tenant_id == tenant_id
        ).first()
        return new_api_key


@router.get("/binance", response_model=ApiKeyResponse)
def get_binance_api_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Get Binance API key status (without revealing the keys).
    """
    api_key = db.query(BinanceApiKey).filter(
        BinanceApiKey.tenant_id == tenant_id
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nu există API keys configurate"
        )
    
    return api_key


@router.delete("/binance")
def delete_binance_api_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Delete Binance API keys.
    """
    api_key = db.query(BinanceApiKey).filter(
        BinanceApiKey.tenant_id == tenant_id
    ).first()
    
    if api_key:
        db.delete(api_key)
        db.commit()
    
    return {"message": "API keys șterse cu succes"}


# Internal function to get decrypted keys for trading
def get_decrypted_api_keys(db: Session, tenant_id: int) -> dict:
    """Get decrypted API keys for trading bot use."""
    api_key = db.query(BinanceApiKey).filter(
        BinanceApiKey.tenant_id == tenant_id,
        BinanceApiKey.is_active == True
    ).first()
    
    if not api_key:
        return None
    
    return {
        "api_key": decrypt_api_key(api_key.api_key_encrypted),
        "api_secret": decrypt_api_key(api_key.api_secret_encrypted),
        "is_testnet": api_key.is_testnet
    }
