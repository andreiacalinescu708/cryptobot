from sqlalchemy import Column, String, Integer, ForeignKey, Numeric, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Trade(Base):
    """Trade history per tenant."""
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Trade details
    trade_id = Column(String(100), unique=True, nullable=False)  # Binance trade ID
    strategy_id = Column(String(50), nullable=False)
    trading_pair = Column(String(20), nullable=False)
    
    # Order details
    side = Column(String(10), nullable=False)  # BUY / SELL
    order_type = Column(String(20), default="MARKET")
    quantity = Column(Numeric(20, 8), nullable=False)
    price = Column(Numeric(20, 8), nullable=False)
    total_amount = Column(Numeric(20, 8), nullable=False)
    
    # P&L tracking (for SELL orders)
    profit_loss = Column(Numeric(20, 8), nullable=True)
    profit_loss_percent = Column(Numeric(10, 4), nullable=True)
    
    # Status
    status = Column(String(20), default="PENDING")  # PENDING, FILLED, CANCELLED, ERROR
    error_message = Column(Text, nullable=True)
    
    # Raw data from Binance
    binance_raw_data = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    executed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="trades")
