from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TenantMixin


class BinanceApiKey(Base):
    """Binance API keys - criptate cu AES-256."""
    __tablename__ = "binance_api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Encrypted API credentials
    api_key_encrypted = Column(Text, nullable=False)
    api_secret_encrypted = Column(Text, nullable=False)
    
    # Additional settings
    is_testnet = Column(String, default=False)  # Use Binance testnet
    is_active = Column(String, default=True)
    
    # Relationships
    user = relationship("User", back_populates="binance_api_key")
