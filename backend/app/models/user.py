from sqlalchemy import Column, String, Boolean, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    """User model - fiecare user este un tenant."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships (one-to-one cu tenant data)
    binance_api_key = relationship("BinanceApiKey", back_populates="user", uselist=False)
    strategy_config = relationship("StrategyConfig", back_populates="user", uselist=False)
    trades = relationship("Trade", back_populates="user")
    payments = relationship("Payment", back_populates="user")
