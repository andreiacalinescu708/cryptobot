from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class StrategyConfigCreate(BaseModel):
    selected_strategy_id: str
    strategy_params: Optional[Dict[str, Any]] = Field(default_factory=dict)
    trading_pair: str = "BTCUSDT"
    timeframe: str = "1h"
    investment_amount: str = "100"
    max_position_size: str = "10"
    stop_loss_percent: str = "5"
    take_profit_percent: str = "10"


class StrategyConfigUpdate(BaseModel):
    selected_strategy_id: Optional[str] = None
    strategy_params: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    trading_pair: Optional[str] = None
    timeframe: Optional[str] = None
    investment_amount: Optional[str] = None
    max_position_size: Optional[str] = None
    stop_loss_percent: Optional[str] = None
    take_profit_percent: Optional[str] = None


class StrategyConfigResponse(BaseModel):
    id: int
    tenant_id: int
    selected_strategy_id: Optional[str]
    is_active: bool
    strategy_params: Dict[str, Any]
    trading_pair: str
    timeframe: str
    investment_amount: str
    max_position_size: str
    stop_loss_percent: str
    take_profit_percent: str
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
