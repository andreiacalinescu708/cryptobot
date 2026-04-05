from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class StrategyConfig(Base):
    """Configurare strategie per utilizator (tenant)."""
    __tablename__ = "strategy_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Strategy selection
    selected_strategy_id = Column(String(50), nullable=True)  # rsi, macd, etc.
    is_active = Column(Boolean, default=False)
    
    # Custom params for selected strategy (JSON)
    strategy_params = Column(JSON, default=dict)
    
    # Trading settings
    trading_pair = Column(String(20), default="BTCUSDT")
    timeframe = Column(String(10), default="1h")
    investment_amount = Column(String(50), default="100")  # USDT
    
    # Risk management
    max_position_size = Column(String(50), default="10")  # % of portfolio
    stop_loss_percent = Column(String(10), default="5")  # %
    take_profit_percent = Column(String(10), default="10")  # %
    
    # Relationships
    user = relationship("User", back_populates="strategy_config")
