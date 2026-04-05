from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_user, get_tenant_id
from app.models.strategy import StrategyConfig
from app.schemas import StrategyConfigCreate, StrategyConfigUpdate, StrategyConfigResponse
from app.models.user import User
from app.strategies import AVAILABLE_STRATEGIES

router = APIRouter(prefix="/strategy-config", tags=["strategy-config"])


@router.post("/", response_model=StrategyConfigResponse)
def create_or_update_strategy_config(
    config_data: StrategyConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Create or update strategy configuration for current tenant.
    """
    # Validate strategy_id
    if config_data.selected_strategy_id not in AVAILABLE_STRATEGIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Strategia '{config_data.selected_strategy_id}' nu există"
        )
    
    # Check if config exists
    existing = db.query(StrategyConfig).filter(
        StrategyConfig.tenant_id == tenant_id
    ).first()
    
    if existing:
        # Update existing
        existing.selected_strategy_id = config_data.selected_strategy_id
        existing.strategy_params = config_data.strategy_params
        existing.trading_pair = config_data.trading_pair
        existing.timeframe = config_data.timeframe
        existing.investment_amount = config_data.investment_amount
        existing.max_position_size = config_data.max_position_size
        existing.stop_loss_percent = config_data.stop_loss_percent
        existing.take_profit_percent = config_data.take_profit_percent
    else:
        # Create new
        new_config = StrategyConfig(
            tenant_id=tenant_id,
            selected_strategy_id=config_data.selected_strategy_id,
            strategy_params=config_data.strategy_params,
            trading_pair=config_data.trading_pair,
            timeframe=config_data.timeframe,
            investment_amount=config_data.investment_amount,
            max_position_size=config_data.max_position_size,
            stop_loss_percent=config_data.stop_loss_percent,
            take_profit_percent=config_data.take_profit_percent,
        )
        db.add(new_config)
    
    db.commit()
    
    # Return updated config
    config = db.query(StrategyConfig).filter(
        StrategyConfig.tenant_id == tenant_id
    ).first()
    
    return config


@router.get("/", response_model=Optional[StrategyConfigResponse])
def get_strategy_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Get strategy configuration for current tenant.
    """
    config = db.query(StrategyConfig).filter(
        StrategyConfig.tenant_id == tenant_id
    ).first()
    
    return config


@router.patch("/", response_model=StrategyConfigResponse)
def partial_update_strategy_config(
    config_data: StrategyConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Partial update of strategy configuration.
    """
    config = db.query(StrategyConfig).filter(
        StrategyConfig.tenant_id == tenant_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configurare negăsită. Creează una mai întâi."
        )
    
    # Update only provided fields
    update_data = config_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    
    return config


@router.post("/activate")
def activate_strategy(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Activate the configured strategy.
    """
    config = db.query(StrategyConfig).filter(
        StrategyConfig.tenant_id == tenant_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nu există strategie configurată"
        )
    
    if not config.selected_strategy_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nu ai selectat nicio strategie"
        )
    
    config.is_active = True
    db.commit()
    
    return {
        "message": "Strategie activată cu succes",
        "strategy": config.selected_strategy_id,
        "is_active": True
    }


@router.post("/deactivate")
def deactivate_strategy(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Deactivate the configured strategy.
    """
    config = db.query(StrategyConfig).filter(
        StrategyConfig.tenant_id == tenant_id
    ).first()
    
    if config:
        config.is_active = False
        db.commit()
    
    return {
        "message": "Strategie dezactivată",
        "is_active": False
    }


@router.get("/my-strategy")
def get_my_active_strategy(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Get current active strategy details with full info.
    """
    config = db.query(StrategyConfig).filter(
        StrategyConfig.tenant_id == tenant_id
    ).first()
    
    if not config or not config.selected_strategy_id:
        return {
            "has_strategy": False,
            "message": "Nu ai selectat nicio strategie"
        }
    
    strategy_class = AVAILABLE_STRATEGIES.get(config.selected_strategy_id)
    strategy_info = strategy_class().get_info() if strategy_class else None
    
    return {
        "has_strategy": True,
        "is_active": config.is_active,
        "strategy": strategy_info,
        "config": {
            "trading_pair": config.trading_pair,
            "timeframe": config.timeframe,
            "investment_amount": config.investment_amount,
            "strategy_params": config.strategy_params,
            "risk_management": {
                "max_position_size": config.max_position_size,
                "stop_loss": config.stop_loss_percent,
                "take_profit": config.take_profit_percent,
            }
        }
    }
