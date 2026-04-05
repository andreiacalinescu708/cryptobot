from sqlalchemy import Column, String, Integer, ForeignKey, Numeric, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Payment(Base):
    """Payment/subscription history per tenant."""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Payment details
    payment_id = Column(String(100), unique=True, nullable=False)  # Crypto.com payment ID
    amount = Column(Numeric(20, 8), nullable=False)
    currency = Column(String(10), default="USDC")  # USDC, BTC, etc.
    
    # Subscription
    subscription_plan = Column(String(20), default="PRO")  # FREE, PRO, ENTERPRISE
    subscription_start = Column(DateTime(timezone=True), nullable=False)
    subscription_end = Column(DateTime(timezone=True), nullable=False)
    
    # Status
    status = Column(String(20), default="PENDING")  # PENDING, COMPLETED, FAILED, REFUNDED
    crypto_com_transaction_id = Column(String(255), nullable=True)
    
    # Metadata
    metadata_json = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="payments")
